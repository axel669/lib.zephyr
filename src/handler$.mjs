/*md
[@] Event Handlers

# Event Handlers

Svelte Wind provides a couple of functions to help make event handlers look
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
*/
const handler$ = (func) =>
    (...args) =>
        (_, ...extra) => func(...args, ...extra)

/*md
## eventHandler$

Wraps a function for currying as an event handler. Unlike the `handler$`
function, the event is passed to the curried function.

### Usage
In the following example, "first" is logged each time the first button is
clicked, and "second" is logged when the second button is clicked.
```js
const clicked = eventHandler$(
    (buttonName) => console.log(buttonName)
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
*/
const eventHandler$ = (func) =>
    (...args) =>
        (...extra) => func(...extra, ...args)

export { handler$, eventHandler$ }
