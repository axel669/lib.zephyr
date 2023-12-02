# Event Handlers

Zephyr provides a couple of functions to help make event handlers look
nicer and bind arguments easier.
*/


/*md
## handler$

Wraps a function for currying as an event handler. The curried function does
not pass the event into final function call.

### Usage
```js
const clicked = handler$(
    (buttonName) => console.log(buttonName)
)
```
```svelte
<!-- logs "first" when clicked -->
<Button on:click={clicked("first")}>
    First
</Button>
<!-- logs "second" when clicked -->
<Button on:click={clicked("second")}>
    Second
</Button>
```

## eventHandler$

Wraps a function for currying as an event handler. Unlike the `handler$`
function, the event is passed to the curried function.

### Usage
In the following example, "first" is logged each time the first button is
clicked, and "second" is logged when the second button is clicked. In both
cases the click event is also logged.
```js
const clicked = eventHandler$(
    (event, buttonName) => console.log(event, buttonName)
)
```
```svelte
<!-- logs the event and "first" when clicked -->
<Button on:click={clicked("first")}>
    First
</Button>
<!-- logs the event and "second" when clicked -->
<Button on:click={clicked("second")}>
    Second
</Button>
```

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
