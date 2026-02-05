<script>
    const {
        ws = "",
        children,
        ...rest
    } = $props()
</script>

<label toggle data-ws={ws} {...rest}>
    {@render children?.()}
</label>
