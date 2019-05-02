'use strict';

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

function formatStringInSandbox(context, callback) {
    const iframe = document.createElement('iframe');
    iframe.src = 'sandbox.html';

    chrome.storage.sync.get({
        buildFormatString: DEFAULT_BUILD_FORMAT_STRING,
        formatString: DEFAULT_FORMAT_STRING
    }, (items) => {
        iframe.addEventListener('load', () => {
            const message = {
                buildFormatString: items.buildFormatString,
                formatString: items.formatString,
                context
            };
            iframe.contentWindow.postMessage(message, '*');
        });

        const responseHandler = (event) => {
            if (event.source !== iframe.contentWindow) { return; }
            
            callback(event.data.result);
    
            window.removeEventListener('message', responseHandler);
        };
        window.addEventListener('message', responseHandler);
    
        document.body.appendChild(iframe);
    });
}

function processUrls(commitUrl, builds) {
    const commit = {
        url: commitUrl,
        hash: new URL(commitUrl).pathname.split('/').reverse().find((part) => !!part)
    };

    for (const build of builds) {
        build.id = new URL(build.url).searchParams.get('buildId')
    }

    formatStringInSandbox({
        commit,
        builds
    }, (result) => {
        console.log(result);
        copyToClipboard(result);
    });
}

function isBuildResultsPage(url) {
    return BUILD_URL_REGEX.test(url);
}

function isCommitPage(url) {
    return COMMIT_URL_REGEX.test(url);
}

chrome.pageAction.onClicked.addListener((tab) => {
    if (isBuildResultsPage(tab.url)) {
        chrome.tabs.executeScript(null, {
            code:  `var result = {
                        commitUrl: document.querySelector('.commit-link').href
                    };
                    result;`
        }, (result) => {
            result = result[0];
            processUrls(result.commitUrl, [{url: tab.url, name: 'BUILD_NAME'}]);
        });
    } else if (isCommitPage(tab.url)) {
        chrome.tabs.executeScript(null, {
            file: 'getBuildUrls.js'
        }, (result) => {
            result = result[0];
            processUrls(tab.url, result.builds);
        });
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