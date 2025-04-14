export default (def, ...variants) => {
    for (const variant of variants) {
        const [entry] = Object.entries(variant)
        const [key, value] = entry
        if (value === true) {
            return `$${key.replace(/[A-Z]/g, (s) => `-${s.toLocaleLowerCase()}`)}`
        }
    }
    return def
}
