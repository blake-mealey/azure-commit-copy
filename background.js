import { BUILD_URL_REGEX, COMMIT_URL_REGEX } from './modules/constants.js';

function isBuildResultsPage(url) {
    return BUILD_URL_REGEX.test(url);
}

function isCommitPage(url) {
    return COMMIT_URL_REGEX.test(url);
}

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
