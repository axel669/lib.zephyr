<script>
    const { ws, children, title, ...rest } = $props()
    const titleAttr = $derived(
        (title === true) ? "" : undefined
    )
</script>

<ws-text data-ws={ws} {...rest} title={titleAttr}>
    {@render children?.()}
</ws-text>
