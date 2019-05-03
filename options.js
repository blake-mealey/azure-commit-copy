import { DEFAULT_BUILD_FORMAT_STRING, DEFAULT_FORMAT_STRING } from './constants.js';

function restoreOptions() {
    chrome.storage.sync.get({
        buildFormatString: DEFAULT_BUILD_FORMAT_STRING,
        formatString: DEFAULT_FORMAT_STRING
    }, (items) => {
        document.getElementById('build-format-string').value = items.buildFormatString;
        document.getElementById('format-string').value = items.formatString;
    });
}

function resetOptions() {
    document.getElementById('build-format-string').value = DEFAULT_BUILD_FORMAT_STRING;
    document.getElementById('format-string').value = DEFAULT_FORMAT_STRING;
}

function saveOptions() {
    const buildFormatString = document.getElementById('build-format-string').value;
    const formatString = document.getElementById('format-string').value;
    
    chrome.storage.sync.set({
        buildFormatString,
        formatString
    }, () => {
        console.log('saved settings');
        const saveBanner = document.getElementById('save-banner');
        saveBanner.classList.remove('is-hidden');
        setTimeout(() => {
            saveBanner.classList.add('is-hidden');
        }, 1000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();

    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('reset').addEventListener('click', resetOptions);
});