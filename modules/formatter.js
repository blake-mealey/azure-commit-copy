export class Formatter {
    constructor(type) {
        this._type = type;
    }

    async formatString(formatString, context) {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.src = 'sandbox.html';

            iframe.addEventListener('load', () => {
                const message = {
                    type: this._type,
                    formatString,
                    context
                };
                iframe.contentWindow.postMessage(message, '*');
            });

            const responseHandler = (event) => {
                if (event.source !== iframe.contentWindow) { return; }

                resolve(event.data.result);

                window.removeEventListener('message', responseHandler);
            };
            window.addEventListener('message', responseHandler);

            document.body.appendChild(iframe);
        });
    }
}