<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cross = "stretch"
    export let main = "start"
    export let scrollable = false

    $: wind = {
        "fl.dir": direction,
        "fl.cross": cross,
        "fl.main": main,
        p: pad,
        gap: gap,
        over: (scrollable === true) ? "auto" : null,
        ...$$restProps
    }
</script>

<ws-flex use:wsx={wind}>
    <slot />
</ws-flex>
