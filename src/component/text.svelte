<script>
    const sizes = {
        title: "title",
        info: "info",
        header: "header",
        subtitle: "subtitle",
    }
    const {
        ws,
        children,
        size,
        notif,
        ...rest
    } = $props()
    const sizeProp = $derived(
        sizes[size]
    )
    const processed = $derived({
        [sizeProp]: "",
        "notif-text": (notif === true) ? "" : undefined,
    })
</script>

<ws-text data-ws={ws} {...rest} {...processed}>
    {@render children?.()}
</ws-text>
