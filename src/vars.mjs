const calcValue = value => {
    if (Array.isArray(value) === false) {
        return value
    }
    if (value[0] === null || value[0] === undefined) {
        return null
    }
    return value.join("")
}
const udpateVars = (node, current, next) => {
    const keys = new Set([
        ...Object.keys(current),
        ...Object.keys(next),
    ])
    for (const key of keys) {
        const varName = `--${key}`
        const currentValue = calcValue(current[key])
        const nextValue = calcValue(next[key])
        if (nextValue === undefined || nextValue === null) {
            node.style.removeProperty(varName)
        }
        if (currentValue !== nextValue) {
            node.style.setProperty(varName, nextValue)
        }
    }
}
const vars = (node, vars) => {
    let currentVars = vars
    udpateVars(node, {}, currentVars)
    return {
        update(newVars) {
            udpateVars(node, currentVars, newVars)
            currentVars = newVars
        }
    }
}

export default vars
