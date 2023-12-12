# Zephyr
Zephyr is a svelte binding for the [Windstorm](https://windstorm.axel669.net)
library, with some additional parts to make it look nice in the markup.

[Docs Here](https://zephyr.axel669.net)

## Installation
Zephyr can be installed through npm (or the variants like yarn, pnpm, etc).

```bash
npm install @axel669/zephyr@0.2.0-beta.1
```

## Components
Components can be imported individually from the library for tree-shaking, or
the entire lib can imported at once, but I dunno how big that bundle will be.
Components can also take any windstorm function as a prop, using the same rules
as the `wsx` action.

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
    import { Button } from "@axel669/zephyr"

    //  bring the whole thing to keep it simple
    import * as Wind from "@axel669/zephyr"
</script>

<!-- the wsx action can be used to setup the ws-x needed for the body -->
<svelte:body use:wsx={{"$theme": theme, "$app": true}} />

<Button on:click={stuff}>
    I'm a button!
</Button>

<Wind.Button on:click={stuff}>
    I'm also button!
</Wind.Button>
```

## Svelte Config
Zephyr does not output any css of its own, so no configuration is required to
make it styled as expected. For people using Svelte 4+ you will need to make
sure your bundler has the browser conditions set as some components do use
lifecycle functions that will not be bundled without the setting.
[Svelte Docs](https://svelte.dev/docs/v4-migration-guide#browser-conditions-for-bundlers)
about the setting.
