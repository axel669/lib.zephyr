<script>
    const {
        children,
        ws = "",
        ...rest
    } = $props()
</script>

<a data-ws="{ws}" {...rest}>
    {@render children?.()}
</a>
