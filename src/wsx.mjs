import wind from "@axel669/windstorm"
const { wsx } = wind

/*md
[@] Actions/wsx

# wsx Action

The wsx action can be used to set the `ws-x` attribute on a DOM element by using
an object as the source rather than trying to do the string manipulation
directly.
- `null`, `undefined`, and `false` will not insert the wind function
- `true` will insert the wind function with no args
- any string value will insert the wind function with the arguments formatted
    for the parser (replace spaces and underscores as needed).

## Usage
```js
// will generate ws-x="grid gr-col[1fr_1fr]"
$: windStff = {
    grid: true,
    gr-col: "1fr 1fr",
    p: false
}
```
```svelte
<div use:wsx={windStuff}>
</div>
```
*/

export default (node, props) => {
    const update = (props) => {
        if (props === null || props === undefined) {
            node.setAttribute("ws-x", null)
            return
        }
        node.setAttribute(
            "ws-x",
            wsx(props)
        )
    }
    update(props)
    return { update }
}
