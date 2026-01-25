<script>
    const { ws, clickable = false, children, ...rest } = $props()
    const clicking = $derived(
        (clickable === true) ? "" : undefined
    )
</script>

<ws-chip data-ws={ws} clickable={clicking} {...rest}>
    {@render children()}
</ws-chip>
