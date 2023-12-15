<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cross = "stretch"
    export let main = "start"

    $: wind = {
        "fl.dir": direction,
        "fl.cross": cross,
        "fl.main": main,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-flex use:wsx={wind}>
    <slot />
</ws-flex>
