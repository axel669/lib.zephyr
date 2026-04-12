# Zephyr

This is going to have content, probably.

## Components
Components can be imported individually from the library for tree-shaking, or
the entire lib can imported at once, but I dunno how big that bundle will be.
Components can also take any windstorm macro as a prop, including custom macros,
using the same rules as the `wsx` covered in
[Functions](./docsite/docs/functions.md).

### Theming
Windstorm expects a theme to be defined on an ancestor of the html elements
that use it, and Zephyr does not automatically set the theme because it can
used anywhere in the page. This means the wsx action (or setting the ws-x
attribute directly) will be needed for components to look right. Any valid
Windstorm theme is usable, including custom ones.

### Example
```svelte
<script>
    //  individual import for tree shaking
    import {
        Button,
        wsx
    } from "@axel669/zephyr"

    //  bring the whole thing to keep it simple
    import * as Wind from "@axel669/zephyr"

    const theme = "dark"
    const handler = () => {
        console.log("button clicked!")
    }
</script>

<!-- the wsx action can be used to setup the ws-x needed for the body -->
<svelte:body use:wsx={{"@theme": theme, "@app": true}} />

<Button on:click={handler}>
    I'm a button!
</Button>

<Wind.Button on:click={handler}>
    I'm also button!
</Wind.Button>
```
