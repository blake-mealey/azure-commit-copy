import { DEFAULT_BUILD_FORMAT_STRING, DEFAULT_FORMAT_STRING } from '../modules/constants.js';
import { Formatter } from '../modules/formatter.js';

function updateCopyStatus(text, state) {
    const copyStatusElement = document.getElementById('copy-status');
    copyStatusElement.textContent = text;
    copyStatusElement.className = '';
    copyStatusElement.classList.add('tag', `bd-${state}`, `text-${state}`);
}

function copyToClipboard(text) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.style.pointerEvents = 'none';
    input.value = text;

    document.body.appendChild(input);
    input.select();

    document.execCommand('Copy');
    document.body.removeChild(input);
};

const sandboxPath = '../sandbox.html';
const buildsStringFormatter = new Formatter('builds', sandboxPath);
const commitStringFormatter = new Formatter('commit', sandboxPath);

async function formatStrings(context) {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            buildFormatString: DEFAULT_BUILD_FORMAT_STRING,
            formatString: DEFAULT_FORMAT_STRING
        }, async (items) => {
            const buildsString = await buildsStringFormatter.formatString(items.buildFormatString,
                context.builds);

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

async function processData(context) {
    const result = await formatStrings(context);

    updateCopyStatus('Copied!', 'success');

    console.log(result);
    copyToClipboard(result);
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.request === 'returnData') {
        processData(message.result);
    }
});

updateCopyStatus('Copying...', 'grey');
chrome.tabs.executeScript(null, {
    file: 'getData.js'
});
