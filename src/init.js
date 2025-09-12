const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'log',
        args: args.map(arg => String(arg))
    }));
    originalLog.apply(console, args);
};

console.error = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'error',
        args: args.map(arg => String(arg))
    }));
    originalError.apply(console, args);
};

console.warn = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'warn',
        args: args.map(arg => String(arg))
    }));
    originalWarn.apply(console, args);
};

console.info = function (...args) {
    window.ipc.postMessage(JSON.stringify({
        type: 'console',
        level: 'info',
        args: args.map(arg => String(arg))
    }));
    originalInfo.apply(console, args);
};
