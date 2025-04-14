<script>
    import wsx from "../wsx.js"

    let {
        color = null,
        text = "",
        children,
        ...rest
    } = $props()

    const wind = $derived({ "$color": color, ...rest })
</script>

<ws-badge ws-text={text} use:wsx={wind}>
    {@render children?.()}
</ws-badge>
