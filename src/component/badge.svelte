<script>
    const { ws, text, children, ...rest } = $props()
</script>

<ws-badge ws-text={text} data-ws={ws} {...rest}>
    {@render children()}
</ws-badge>
