const __console_log__ = console.log;
const __console_error__ = console.error;
const __console_warn__ = console.warn;
const __console_info__ = console.info;
const __console_debug__ = console.debug;
const __console_trace__ = console.trace;

console.log = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'log',
        args: args.map(arg => String(arg))
    }));
    __console_log__.apply(console, args);
};

console.error = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'error',
        args: args.map(arg => String(arg))
    }));
    __console_error__.apply(console, args);
};

console.warn = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'warn',
        args: args.map(arg => String(arg))
    }));
    __console_warn__.apply(console, args);
};

console.info = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'info',
        args: args.map(arg => String(arg))
    }));
    __console_info__.apply(console, args);
};

console.info = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'info',
        args: args.map(arg => String(arg))
    }));
    __console_info__.apply(console, args);
};

console.debug = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'debug',
        args: args.map(arg => String(arg))
    }));
    __console_debug__.apply(console, args);
};

console.trace = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'trace',
        args: args.map(arg => String(arg))
    }));
    __console_trace__.apply(console, args);
};

window.rpc = {
    callbacks: new Map(),
    nextId: 0,

    postMessage: function (message) {
        return new Promise((resolve, reject) => {
            const messageObj = typeof message === 'string' ? JSON.parse(message) : message;
            const messageId = this.nextId++;

            messageObj.data.callbackId = messageId;
            this.callbacks.set(messageId, { resolve, reject });

            setTimeout(() => {
                if (this.callbacks.has(messageId)) {
                    this.callbacks.delete(messageId);
                    reject(new Error('RPC response timeout'));
                }
            }, 10000);

            if (window.ipc) {
                window.ipc.postMessage(JSON.stringify(messageObj));
            } else {
                reject(new Error('IPC not available'));
            }
        });
    },

    handleResponse: function (response) {
        if (response.data.callbackId !== undefined) {
            const callbackId = response.data.callbackId;
            const callback = this.callbacks.get(callbackId);
            if (callback) {
                this.callbacks.delete(callbackId);
                callback.resolve(response);
            }
        }
    }
};
