<script>
    import { fly } from "svelte/transition"

    import wsx from "./wsx.mjs"

    import Paper from "./paper.svelte"

    const slide = (node, options) => ({
        delay: 0,
        duration: 200,
        css: (t, u) => `
            transform: translateX(-${u * 100}%);
            opacity: ${t};
        `
    })

    const animation = {
        duration: 200
    }

    $: paper = {
        "@menu": true,
        w: "15vw",
        ...$$restProps
    }
</script>
<ws-modal ws-x="$show">
    <ws-paper use:wsx={paper} transition:slide>
        <slot name="header" />
        <slot name="content" />
        <slot name="footer" />
    </ws-paper>
</ws-modal>
