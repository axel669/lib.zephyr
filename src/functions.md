# Library Functions/Actions

Zephyr has a few functions to make some tasks easier for working with the
library.

## handler$

Wraps a function for currying as an event handler. The curried function does
not pass the event into final function call.

### Example
```svelte
<script>
    import { handler$ } from "@axel669/zephyr"

    const clicked = handler$(
        (buttonName) => console.log(buttonName)
    )
</script>

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

### Example

```svelte
<script>
    import { eventHandler$ } from "@axel669/zephyr"

    const clicked = eventHandler$(
        (event, buttonName) => console.log(event, buttonName)
    )
</script>

<!-- logs the event and "first" when clicked -->
<Button on:click={clicked("first")}>
    First
</Button>
<!-- logs the event and "second" when clicked -->
<Button on:click={clicked("second")}>
    Second
</Button>
```

## wsx Action

The wsx action can be used to set the `ws-x` attribute on a DOM element by using
an object as the source rather than trying to do the string manipulation
directly.
- `null`, `undefined`, and `false` will not insert the wind function
- `true` will insert the wind function with no args
- any string value will insert the wind function with the arguments formatted
    for the parser (replace spaces and underscores as needed).

### Example
```svelte
<script>
    import { wsx } from "@axel669/zephyr"

    // will generate ws-x="grid gr-col[1fr 1fr]"
    const wsxProps = {
        grid: true,
        "gr.cols": "1fr 1fr",
        bg: null
    }
</script>

<div use:wsx={wsxProps}>
    <span>Content</span>
</div>
```
