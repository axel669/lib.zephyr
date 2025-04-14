<script>
    import wsx from "../wsx.js"

    const {
        text = "",
        bottom = false,
        children,
        ...rest
    } = $props()

    const wind = $derived({
        $bottom: bottom,
        ...rest,
    })
</script>

<ws-tooltip ws-text={text} use:wsx={wind}>
    {@render children?.()}
</ws-tooltip>
