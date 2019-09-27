(function() {
    'use strict';

    function interval(callback, timeout = 500, maxTries = 5) {
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

    async function openPopupAsync(buttonSelector, popupSelector) {
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

    const BUILD_LINK_REGEX = /^(?<name>.+) (?:build) (?<instance>.+ )?(?<status>\w+)$/;

    async function getData() {
        const data = {};

        data.commit = {
            url: window.location.href,
            hash: getPathEnd(window.location.href)
        };
        data.commit.shortHash = data.commit.hash.substr(0, 8);

        await openPopupAsync('.status-state', '.status-flyout-content');
        const buildLinks = Array.from(document.querySelectorAll('.status-target-url-link'));

        data.builds = buildLinks
            .filter((link) => BUILD_LINK_REGEX.test(link.textContent))
            .map((link) => {
                return {
                    url: link.href,
                    id: new URL(link.href).searchParams.get('buildId'),
                    name: BUILD_LINK_REGEX.exec(link.textContent).groups.name
                };
            });

        // Sometimes, there is a handy branch and PR badge available to us. Use that if we can because
        // it's faster. If it's not there, use the slower PR dropdown
        let branchBadge, prBadge;
        try {
            branchBadge = await getElementAsync('.branch-stats-badge');
            prBadge = await getElementAsync('.pr-for-branch-badge');
        } catch {
            await openPopupAsync('.associated-pull-requests-flyout .stat-badge', '.pullrequest-list');
            branchBadge = await getElementAsync('.vc-pullrequest-detail-branch-name');
            prBadge = await getElementAsync('.pullrequest-list .ms-Link');
        } finally {
            const textNode = branchBadge.querySelector('.stat-text');
            data.branch = {
                url: branchBadge.href,
                name: textNode ? textNode.textContent : branchBadge.textContent
            };

            data.pullRequest = {
                id: getPathEnd(prBadge.href),
                url: prBadge.href
            };
        }

        return data;
    }

    async function getResult() {
        try {
            const data = await getData();
            chrome.runtime.sendMessage(null, {
                request: 'getDataSuccess',
                data
            });
        } catch (error) {
            chrome.runtime.sendMessage(null, {
                request: 'getDataError',
                error: error.message
            });
        }
    }

    getResult();
})();
