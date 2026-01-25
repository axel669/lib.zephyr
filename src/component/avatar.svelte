<script>
    const { ws, image, type = "image/png", text, children, ...rest } = $props()
</script>

<ws-avatar data-ws={ws} {...rest}>
    {#if children !== undefined}
        {@render children()}
    {:else if text !== undefined}
        {text}
    {:else}
        <!-- svelte-ignore a11y_missing_attribute -->
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <object data={image} {type} />
    {/if}
</ws-avatar>
