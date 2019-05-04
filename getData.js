(function() {
    'use strict';

    function interval(callback, timeout = 500, maxTries = 10) {
        return new Promise((resolve, reject) => {
            let tries = 0;
            const runCallback = function (intervalId) {
                const result = callback();
                if (result) {
                    resolve(result);
                    clearInterval(intervalId);
                }
                
                if (++tries === maxTries) {
                    reject(`'callback' did not return truthy after ${tries} tries at intervals of ${timeout}ms.`);
                    clearInterval(intervalId);
                }
            };

            const intervalId = setInterval(() => {
                runCallback(intervalId);
            }, timeout);
            runCallback(intervalId);
        });
    }

    function doesElementExist(elementSelector) {
        return !!document.querySelector(elementSelector);
    }

    async function getElementAsync(elementSelector) {
        return await interval(() => document.querySelector(elementSelector));
    }

    async function openPopup(buttonSelector, popupSelector) {
        return await interval(() => {
            if (!doesElementExist(popupSelector)) {
                document.querySelector(buttonSelector).click();
            }
            return doesElementExist(popupSelector);
        });
    }

    function getPathEnd(url) {
        return new URL(url).pathname.split('/').reverse().find((x) => !!x);
    }

    const BUILD_LINK_REGEX = /^(?<name>.+) (?:build) (?<instance>.+) (?<status>\w+)$/;

    async function getResult() {
        const result = {};

        result.commit = {
            url: window.location.href,
            hash: getPathEnd(window.location.href)
        };

        await openPopup('.status-state', '.status-flyout-content');
        const buildLinks = Array.from(document.querySelectorAll('.status-target-url-link'));

        result.builds = buildLinks
            .filter((link) => BUILD_LINK_REGEX.test(link.textContent))
            .map((link) => {
                return {
                    url: link.href,
                    id: new URL(link.href).searchParams.get('buildId'),
                    name: BUILD_LINK_REGEX.exec(link.textContent).groups.name
                };
            });

        const branchBadge = await getElementAsync('.branch-stats-badge');
        result.branch = {
            url: branchBadge.href,
            name: branchBadge.querySelector('.stat-text').textContent
        };

        const prBadge = await getElementAsync('.pr-for-branch-badge');
        result.pullRequest = {
            id: getPathEnd(prBadge.href),
            url: prBadge.href
        };

        chrome.runtime.sendMessage(null, {
            request: 'returnData',
            result
        });
    }

    getResult();
})();