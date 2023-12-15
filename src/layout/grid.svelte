<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cols = null
    export let rows = null
    export let autoCol = false
    export let autoRow = false

    $: wind = {
        "gr.flow": direction,
        "gr.cols": cols?.join?.(" ") ?? cols ?? false,
        "gr.rows": rows?.join?.(" ") ?? rows ?? false,
        "gr.cols.a": autoCol,
        "gr.rows.a": autoRow,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-grid use:wsx={wind}>
    <slot />
</ws-grid>
