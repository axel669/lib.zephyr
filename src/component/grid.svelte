<script>
    const { ws, children, ...rest } = $props()
</script>

<ws-grid data-ws={ws} {...rest}>
    {@render children?.()}
</ws-grid>
