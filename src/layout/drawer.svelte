<svelte:options immutable />

<script context="module">
    const defs = {
        select: {
            "$select": true,
            "w.min": "35vw",
            grid: true,
            over: "hidden"
        },
        menu: {
            "$menu": true,
        },
        action: {
            "$action": true,
        }
    }
</script>

<script>
    import wsx from "../wsx.mjs"

    import Paper from "./paper.svelte"

    export let height
    export let type = "menu"

    const trick = (node, options) => ({
        delay: 0,
        duration: 250,
        css: () => "",
    })

    $: container = {
        ...defs[type],
        h: (type === "select") ? height : "100%",
        grid: true,
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<wind-drawer-container use:wsx={container} on:click|stopPropagation
role="menubar" transition:trick>
    <Paper {...$$restProps}>
        <slot name="header" slot="header" />
        <slot />
        <slot name="footer" slot="footer" />
    </Paper>
</wind-drawer-container>
