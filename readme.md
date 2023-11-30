NOTE: add docs for dumbass svelte browser resolve bullshit
https://svelte.dev/docs/v4-migration-guide#browser-conditions-for-bundlers

# Zephyr
Zephyr is a svelte binding for the
[Windstorm](https://www.npmjs.com/package/@axel669/windstorm)
library.

[Docs Here](https://svelte-wind.axel669.net)

## Installation
Zephyr can be installed through npm (or the variants like yarn, pnpm, etc).

```bash
npm install @axel669/svelte-wind
```

## Usage
Components can be imported individually from the library for tree-shaking, or
the entire lib can imported at once, but I dunno how big that bundle will be.

```svelte
<script>
    //  individual import for tree shaking
    import { Button } from "@axel69/svelte-wind"

    //  bring the whole thing to keep it simple
    import * as Wind from "@axel69/svelte-wind"
</script>

<!-- the wsx action can be used to setup the ws-x needed for the body -->
<svelte:body use:wsx={{theme, "@app": true}} />

<Button on:click={stuff}>
    I'm a button!
</Button>

<Wind.Button on:click={stuff}>
    I'm also button!
</Wind.Button>
```

### Svelte Config
No special configuration of svelte is required, nor is there a separate plugin
that needs to be added. Just have svelte and you're good to go.
