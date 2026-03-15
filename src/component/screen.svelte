<script>
    import Paper from "./paper.svelte"

    const {
        ws,
        children,
        header,
        footer,
        content,
        screenContent,
        paperWS = "",
        layoutWS = "",
        ...rest
    } = $props()
</script>

<ws-screen data-ws={ws} {...rest}>
    {#if screenContent}
        {@render screenContent()}
    {:else}
        <Paper
            {header}
            {footer}
            {children}
            {content}
            {layoutWS}
            ws={paperWS}
        />
    {/if}
</ws-screen>
