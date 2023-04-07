<script>
    import wsx from "./wsx.mjs"

    export let color
    export let card = false
    export let square = false

    $: wind = {
        $color: color,
        "@outline": card,
        r: square && "0px",
        ...$$restProps
    }
</script>

<ws-paper use:wsx={wind}>
    <slot name="header" />
    <slot name="content" />
    <slot name="footer" />
</ws-paper>
