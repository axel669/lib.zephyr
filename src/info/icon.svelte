<script>
    import wsx from "../wsx.js"

    const { name, children, ...rest } = $props()
</script>

<ws-icon data-icon={name} use:wsx={rest}>
    {@render children?.()}
</ws-icon>
