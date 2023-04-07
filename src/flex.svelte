<script>
    import wsx from "./wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cross = "start"
    export let main = "start"

    $: wind = {
        "fl-dir": direction,
        "fl-cr-a": cross,
        "fl-m-a": main,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-flex use:wsx={wind}>
    <slot />
</ws-flex>
