<script>
    const { ws, name, children, ...rest } = $props()
</script>

<ws-icon data-icon={name} data-ws={ws} {...rest}>
    {@render children?.()}
</ws-icon>
