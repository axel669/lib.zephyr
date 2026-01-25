<script>
    const { ws, children, ...rest } = $props()
</script>

<ws-flex data-ws={ws} {...rest}>
    {@render children?.()}
</ws-flex>
