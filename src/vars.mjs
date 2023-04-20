/*md
[@] Actions/vars

# vars Action

The vars action is used to set css variables on dom elements using a simple
object to maintain the values instead of needing to do string interpolation and
falsey checks manually.

## Usage
```js
//  Sets --screen-widt to 100% and unsets --other-thing
$: settings = {
    "screen-width": "100%",
    "other-thing": null,
}
```
```svelte
<ws-screen use:vars={settings}>
</ws-screen>
```
*/

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
