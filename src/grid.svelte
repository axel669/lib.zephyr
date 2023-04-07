<script>
    import wsx from "./wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cols = null
    export let rows = null
    export let autoCol = false
    export let autoRow = false

    $: wind = {
        "gr-dir": direction,
        "gr-col": cols?.join(" ") ?? false,
        "gr-row": rows?.join(" ") ?? false,
        "gr-acol": autoCol,
        "gr-arow": autoRow,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-grid use:wsx={wind}>
    <slot />
</ws-grid>
