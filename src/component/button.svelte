<script>
    const { ws = "", children, ...rest } = $props()
</script>

<button data-ws={ws} {...rest}>
    {@render children?.()}
</button>
