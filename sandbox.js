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
        try {
            if (event.data.type === 'builds') {
                message.result = formatBuildsString(event.data.formatString, event.data.context);
            } else if (event.data.type === 'commit') {
                message.result = formatCommitString(event.data.formatString, event.data.context);
            }
        } catch (error) {
            message.error = JSON.parse(JSON.stringify(error));
        }
        event.source.postMessage(message, event.origin);
    });
})();
