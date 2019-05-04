import { DEFAULT_BUILD_FORMAT_STRING, DEFAULT_FORMAT_STRING, BUILD_URL_REGEX, COMMIT_URL_REGEX } from './modules/constants.js';
import { Formatter } from './modules/formatter.js';

function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
};

const buildsStringFormatter = new Formatter('builds');
const commitStringFormatter = new Formatter('commit');

async function formatStrings(context) {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            buildFormatString: DEFAULT_BUILD_FORMAT_STRING,
            formatString: DEFAULT_FORMAT_STRING
        }, async (items) => {
            const buildsString = await buildsStringFormatter.formatString(items.buildFormatString, context.builds);
            const result = await commitStringFormatter.formatString(items.formatString, {
                branch: context.branch,
                pullRequest: context.pullRequest,
                commit: context.commit,
                buildsString
            });

            resolve(result);
        });
    });
}

function getPathEnd(url) {
    return new URL(url).pathname.split('/').reverse().find((x) => !!x);
}

async function processUrls(commitUrl, builds, pullRequest, branch) {
    const commit = {
        url: commitUrl,
        hash: getPathEnd(commitUrl)
    };

    for (const build of builds) {
        build.id = new URL(build.url).searchParams.get('buildId')
    }

    pullRequest.id = getPathEnd(pullRequest.url);

    const result = await formatStrings({
        commit,
        builds,
        pullRequest,
        branch
    });

    console.log(result);
    copyToClipboard(result);
}

function isBuildResultsPage(url) {
    return BUILD_URL_REGEX.test(url);
}

function isCommitPage(url) {
    return COMMIT_URL_REGEX.test(url);
}

chrome.pageAction.onClicked.addListener((tab) => {
    /*if (isBuildResultsPage(tab.url)) {
        chrome.tabs.executeScript(null, {
            code:  `var result = {
                        commitUrl: document.querySelector('.commit-link').href
                    };
                    result;`
        }, (result) => {
            result = result[0];
            processUrls(result.commitUrl, [{url: tab.url, name: 'BUILD_NAME'}]);
        });
    } else*/

    if (isCommitPage(tab.url)) {
        chrome.tabs.executeScript(null, {
            file: 'getBuildUrls.js'
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.request === 'returnBuildUrls') {
        processUrls(sender.tab.url, message.result.builds, message.result.pullRequest, message.result.branch);
    }
});

function updateBrowserActionVisibility(tab) {
    if (isBuildResultsPage(tab.url) || isCommitPage(tab.url)) {
        chrome.pageAction.show(tab.id);
    } else {
        chrome.pageAction.hide(tab.id);
    }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        updateBrowserActionVisibility(tab);
    });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.url) {
        updateBrowserActionVisibility(tab);
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => updateBrowserActionVisibility(tab));
    });
});
