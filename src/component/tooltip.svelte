<script>
    const {
        ws,
        children,
        ...rest
    } = $props()
</script>

<ws-tooltip data-ws={ws} {...rest}>
    {@render children?.()}
</ws-tooltip>
