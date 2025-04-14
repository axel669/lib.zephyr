export const trackChanges = (initial) => {
    let current = initial
    return (next) => {
        if (next !== current) {
            current = next
            return true
        }
        return false
    }
}
