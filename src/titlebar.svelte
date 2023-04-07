<script>
    import wsx from "./wsx.mjs"

    export let color
    export let fill = false

    $: wind = {
        $color: color,
        "@fill": fill,
        ...$$restProps
    }
</script>

<ws-titlebar use:wsx={wind}>
    <slot name="menu" />
    <slot name="title" />
    <slot name="action" />
</ws-titlebar>
