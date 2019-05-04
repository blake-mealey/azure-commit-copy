export class Formatter {
    constructor(type, sandboxPath = 'sandbox.html') {
        this._type = type;
        this._sandboxPath = sandboxPath;
    }

    async formatString(formatString, context) {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.opacity = 0;
            iframe.style.pointerEvents = 'none';
            iframe.src = this._sandboxPath;

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
                document.body.removeChild(iframe);
            };
            window.addEventListener('message', responseHandler);

            document.body.appendChild(iframe);
        });
    }
}