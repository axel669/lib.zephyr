const handler$ = (func) =>
    (...args) =>
        (_, ...extra) => func(...args, ...extra)
const eventHandler$ = (func) =>
    (...args) =>
        (...extra) => func(...extra, ...args)

export { handler$, eventHandler$ }
