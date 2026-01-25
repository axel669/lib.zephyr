<script>
    let {
        open =  $bindable(false),
        ws,
        summaryWS,
        children,
        label = "",
        summary,
        ...rest
    } = $props()
</script>

<details data-ws={ws ?? ""} bind:open {...rest}>
    {#if summary !== undefined}
        {@render summary()}
    {:else}
        <summary data-ws={summaryWS}>
            {label}
        </summary>
    {/if}
    {@render children()}
</details>
