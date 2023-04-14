<script>
    import { fly } from "svelte/transition"

    import wsx from "./wsx.mjs"

    import Paper from "./paper.svelte"

    export let close

    const cancel = () => close?.()

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
<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-modal ws-x="$show" on:click={cancel}>
    <ws-paper use:wsx={paper} transition:slide on:click|stopPropagation>
        <slot name="header" />
        <slot name="content" />
        <slot name="footer" />
    </ws-paper>
</ws-modal>
