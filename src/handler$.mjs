/**
Wraps a handler function for easy reuse.

@param {Function} func The handler function to wrap
*/
const handler$ = (func) =>
    (...args) =>
        (_, ...extra) => func(...args, ...extra)

/**
Wraps a handler function for easy reuse, and doesn't throw away the event arg
passed by events firing.

@param {Function} func The handler function to wrap
*/
const eventHandler$ = (func) =>
    (...args) =>
        (...extra) => func(...extra, ...args)

export { handler$, eventHandler$ }
