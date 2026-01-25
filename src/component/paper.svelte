<script>
    import Flex from "./flex.svelte"

    const {
        ws,
        children,
        content,
        header,
        footer,
        layoutWS = "",
        ...rest
    } = $props()
</script>

<ws-paper data-ws={ws} {...rest}>
    {#if header}
        <ze-header data-ws="disp.grid; p: 0px; area: header;">
            {@render header()}
        </ze-header>
    {/if}
    {#if content}
        {@render content()}
    {:else}
        <Flex ws={layoutWS}>
            {@render children?.()}
        </Flex>
    {/if}
    {#if footer}
        <ze-footer data-ws="disp.grid; p: 0px; area: footer;">
            {@render footer()}
        </ze-footer>
    {/if}
</ws-paper>
