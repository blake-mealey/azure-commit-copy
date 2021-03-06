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
        url: "https://example.com/commit/421532a421532a421532a",
        shortHash: "421532a4",
        hash: "421532a421532a421532a"
    }
};

let errorState;

async function refreshPreviews() {
    const buildsElement = document.getElementById('build-format-string');
    const buildsPreviewElement = document.getElementById('build-format-string-preview');

    const commitElement = document.getElementById('format-string');
    const commitPreviewElement = document.getElementById('format-string-preview');

    const commitContext = { ...previewContext };

    errorState = false;

    try {
        commitContext.buildsString = await buildsStringFormatter.formatString(buildsElement.value, buildsPreviewContext);
        buildsPreviewElement.value = commitContext.buildsString;

        buildsElement.classList.remove('bd-error');
        buildsPreviewElement.classList.remove('bd-error');
    } catch (error) {
        errorState = true;
        buildsPreviewElement.value = error;

        buildsElement.classList.add('bd-error');
        buildsPreviewElement.classList.add('bd-error');
    }

    try {
        const commitPreview = await commitStringFormatter.formatString(commitElement.value, commitContext);
        commitPreviewElement.value = commitPreview;

        commitElement.classList.remove('bd-error');
        commitPreviewElement.classList.remove('bd-error');
    } catch (error) {
        errorState = true;
        commitPreviewElement.value = error;

        commitElement.classList.add('bd-error');
        commitPreviewElement.classList.add('bd-error');
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
    if (errorState) {
        updateSaveStatus('Fix errors before saving', 'error');
        return;
    }

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
