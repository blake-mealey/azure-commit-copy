(function() {
    'use strict';

    function evalWithContext(js, context) {
        return new Function(`with(this) { return ${js}; }`).call(context);
    }

    function formatBuildsString(formatString, context) {
        return context.map(
            (build) => evalWithContext(`\`${formatString}\``, {build})).join('');
    }

    function formatCommitString(formatString, context) {
        return evalWithContext(`\`${formatString}\``, context);
    }

    window.addEventListener('message', (event) => {
        const message = {};
        if (event.data.type === 'builds') {
            message.result = formatBuildsString(event.data.formatString, event.data.context);
        } else if (event.data.type === 'commit') {
            message.result = formatCommitString(event.data.formatString, event.data.context);
        }
        event.source.postMessage(message, event.origin);
    });
})();
