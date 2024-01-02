<svelte:options immutable />

<script>
    import { fade } from "svelte/transition"

    import wsx from "../wsx.mjs"

    import Paper from "./paper.svelte"

    const trick = (node, options) => ({
        delay: 0,
        duration: 250,
        css: () => "",
    })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<wind-wrapper transition:trick ws-x="@dialog [grid]" on:click|stopPropagation
role="dialog">
    <Paper {...$$props}>
        <slot name="header" slot="header" />
        <slot />
        <slot name="footer" slot="footer" />
    </Paper>
</wind-wrapper>
