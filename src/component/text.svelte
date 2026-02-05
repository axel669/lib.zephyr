<script>
    const {
        ws,
        children,
        title,
        notif,
        info,
        header,
        subtitle,
        ...rest
    } = $props()
    const type = $derived(
        (title && { title: "" })
        || (notif && { "notif-text": "" })
        || (info && { info: "" })
        || (header && { header: "" })
        || (subtitle && { subtitle: "" })
        || {}
    )
</script>

<ws-text data-ws={ws} {...rest} {...type}>
    {@render children?.()}
</ws-text>
