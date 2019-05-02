(function() {
    function interval(callback) {
        return new Promise((resolve) => {
            const duration = 500;

            const runCallback = function (intervalId) {
                const result = callback();
                if (result) {
                    resolve(result);
                    clearInterval(intervalId);
                }
            };

            const intervalId = setInterval(() => {
                runCallback(intervalId);
            }, duration);
            runCallback(intervalId);
        });
    }

    function doesElementExist(elementSelector) {
        return !!document.querySelector(elementSelector);
    }

    async function waitUntilElementExists(elementSelector) {
        return await interval(() => doesElementExist(elementSelector));
    }

    async function openPopup(buttonSelector, popupSelector) {
        return await interval(() => {
            if (!doesElementExist(popupSelector)) {
                document.querySelector(buttonSelector).click();
            }
            return doesElementExist(popupSelector);
        });
    }

    const BUILD_LINK_REGEX = /^(?<name>.+) (?:build) (?<instance>.+) (?<status>\w+)$/;

    async function getResult() {
        const result = {};

        await openPopup('.status-state', '.status-flyout-content');
        const buildLinks = Array.from(document.querySelectorAll('.status-target-url-link'));

        result.builds = buildLinks
            .filter((link) => BUILD_LINK_REGEX.test(link.textContent))
            .map((link) => {
                return {
                    url: link.href,
                    name: BUILD_LINK_REGEX.exec(link.textContent).groups.name
                };
            });

        await openPopup('.stat-badge', '.pullrequests-flyout-content');
        await waitUntilElementExists('.pullrequest-list .card-details');
        const pullRequestLinks = Array.from(document.querySelectorAll('.pullrequest-list .card-details .ms-Link.primary-text'));

        result.pullRequests = pullRequestLinks
            .map((link) => {
                return {
                    url: link.href
                };
            });

        chrome.runtime.sendMessage(null, {
            request: 'returnBuildUrls',
            result
        });
    }

    getResult();
})();