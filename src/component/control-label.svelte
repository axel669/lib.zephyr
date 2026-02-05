<script>
    const {
        ws,
        labelWS,
        label,
        children,
        start,
        end,
        extra,
        ...rest
    } = $props()
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

    {#if start}
        <ze-input-start data-ws="area: start; disp.grid;">
            {@render start()}
        </ze-input-start>
    {/if}
    {#if end}
        <ze-input-end data-ws="area: end; disp.grid;">
            {@render end()}
        </ze-input-end>
    {/if}
    {#if extra}
        <ze-input-extra data-ws="area: extra; disp.grid;">
            {@render extra()}
        </ze-input-extra>
    {/if}
</label>
