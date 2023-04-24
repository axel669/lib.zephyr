

# Svelte Wind
Svelte Wind is a svelte binding for the
[Windstorm](https://www.npmjs.com/package/@axel669/windstorm)
library.

## Installation
Svelte Wind can be installed through npm (or the variants like yarn, pnpm, etc).

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