<script context="module">
    const defs = {
        select: {
            "@select": true,
            "w-min": "35vw",
            grid: true,
            over: "hidden"
        },
        menu: {
            "@menu": true,
            w: "15vw",
        },
        action: {
            "@action": true,
            w: "15vw",
        }
    }
    const css = {
        select: (t, u) => `
            transform: translateY(-${u * 100}%);
            opacity: ${t};
        `,
        menu: (t, u) => `
            transform: translateX(-${u * 100}%);
            opacity: ${t};
        `,
        action: (t, u) => `
            transform: translateX(${u * 100}%);
            opacity: ${t};
        `
    }
</script>

<script>
    import { fly } from "svelte/transition"

    import wsx from "./wsx.mjs"

    import Paper from "./paper.svelte"

    export let close
    export let height
    export let type = "menu"

    const cancel = () => close?.()

    const slide = (node, options) => ({
        delay: 0,
        duration: 200,
        css: css[type],
    })

    const animation = {
        duration: 200
    }

    $: container = {
        ...defs[type],
        h: (type === "select") && height,
    }
    $: paper = $$restProps
    // $: paper = {
    //     // "@select": true,
    //     // "w-min": "35vw",
    //     ...$$restProps
    // }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-modal ws-x="$show" on:click={cancel}>
    <drawer-container use:wsx={container} on:click|stopPropagation>
        <ws-paper use:wsx={paper} transition:slide>
            <slot name="header" />
            <slot name="content" />
            <slot name="footer" />
        </ws-paper>
    </drawer-container>
</ws-modal>
