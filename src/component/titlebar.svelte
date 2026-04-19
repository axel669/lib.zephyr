<script>
    const {
        ws,
        children,
        menu,
        action,
        ...rest
    } = $props()
</script>

<ws-titlebar data-ws={ws} {...rest}>
    {#if menu}
        <ze-menu data-ws="grid; p: 0px; area: menu;">
            {@render menu()}
        </ze-menu>
    {/if}
    {@render children?.()}
    {#if action}
        <ze-action data-ws="grid; p: 0px; area: action;">
            {@render action()}
        </ze-action>
    {/if}
</ws-titlebar>
