import { DEFAULT_BUILD_FORMAT_STRING, DEFAULT_FORMAT_STRING } from '../modules/constants.js';
import { Formatter } from '../modules/formatter.js';

const sandboxPath = '../sandbox.html';
const buildsStringFormatter = new Formatter('builds', sandboxPath);
const commitStringFormatter = new Formatter('commit', sandboxPath);

const buildsPreviewContext = [
    {
        url: "https://example.com/build/89762",
        name: "Client",
        id: "89762"
    },
    {
        url: "https://example.com/build/89775",
        name: "Server",
        id: "89775"
    }
];

const previewContext = {
    branch: {
        url: "https://example.com/repo/master",
        name: "master"
    },
    pullRequest: {
        url: "https://example.com/pr/1000",
        id: "1000"
    },
    commit: {
        url: "https://example.com/commit/421532a",
        hash: "421532a"
    }
};

async function refreshPreviews() {
    const buildsPreviewElement = document.getElementById('build-format-string-preview');
    const commitPreviewElement = document.getElementById('format-string-preview');

    const commitContext = { ...previewContext };

    try {
        commitContext.buildsString = await buildsStringFormatter.formatString(document.getElementById('build-format-string').value, buildsPreviewContext);
        buildsPreviewElement.value = commitContext.buildsString;
    } catch (error) {
        buildsPreviewElement.value = error;
    }

    try {
        const commitPreview = await commitStringFormatter.formatString(document.getElementById('format-string').value, commitContext);
        commitPreviewElement.value = commitPreview;
    } catch (error) {
        commitPreviewElement.value = error;
    }
}

function restoreOptions() {
    chrome.storage.sync.get({
        buildFormatString: DEFAULT_BUILD_FORMAT_STRING,
        formatString: DEFAULT_FORMAT_STRING
    }, (items) => {
        document.getElementById('build-format-string').value = items.buildFormatString;
        document.getElementById('format-string').value = items.formatString;
        refreshPreviews();
    });
}

function resetOptions() {
    document.getElementById('build-format-string').value = DEFAULT_BUILD_FORMAT_STRING;
    document.getElementById('format-string').value = DEFAULT_FORMAT_STRING;
}

function updateSaveStatus(text, state) {
    const saveStatusElement = document.getElementById('save-status');
    saveStatusElement.textContent = text;
    saveStatusElement.className = '';
    saveStatusElement.classList.add('tag', `bd-${state}`, `text-${state}`);

    setTimeout(() => {
        saveStatusElement.classList.add('is-hidden');
    }, 2000);
}

function saveOptions() {
    const buildFormatString = document.getElementById('build-format-string').value;
    const formatString = document.getElementById('format-string').value;

    chrome.storage.sync.set({
        buildFormatString,
        formatString
    }, () => {
        updateSaveStatus('Saved!', 'success');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();

    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('reset').addEventListener('click', resetOptions);

    document.getElementById('build-format-string').addEventListener('input', refreshPreviews);
    document.getElementById('format-string').addEventListener('input', refreshPreviews);
});
