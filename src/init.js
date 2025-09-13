const __console_log__ = console.log;
const __console_error__ = console.error;
const __console_warn__ = console.warn;
const __console_info__ = console.info;

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
