<script>
    const { ws, labelWS, label, children, ...rest } = $props()
</script>

<label control data-ws={ws ?? ""} {...rest}>
    {#if label}
        <ws-text label-text data-ws={labelWS}>
            {#if typeof label !== "function"}
                {label}
            {:else}
                {@render label()}
            {/if}
        </ws-text>
    {/if}
    {@render children()}
</label>
