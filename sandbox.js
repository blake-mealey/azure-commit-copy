(function() {
    'use strict';

    function evalWithContext(js, context) {
        return new Function(`with(this) { return ${js}; }`).call(context);
    }

    window.addEventListener('message', (event) => {
        const context = event.data.context;

        const buildFormatString = event.data.buildFormatString;
        context.buildsString = context.builds.map(
            (build) => evalWithContext(`\`${buildFormatString}\``, {build})).join('');

        const formatString = event.data.formatString;
        const result = evalWithContext(`\`${formatString}\``, context);

        const message = {
            result
        };
        event.source.postMessage(message, event.origin);
    });
})();