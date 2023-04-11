<script>
    import { fade } from "svelte/transition"

    import wsx from "./wsx.mjs"

    import Paper from "./paper.svelte"

    $: paper = {
        "@dialog": true,
        "@outline": true,
        ...$$restProps
    }
</script>
<ws-modal ws-x="$show">
    <ws-paper use:wsx={paper} transition:fade={{ duration: 200 }}>
        <slot name="header" />
        <slot name="content" />
        <slot name="footer" />
    </ws-paper>
</ws-modal>
