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
    <summary data-ws={summaryWS}>
        {#if summary !== undefined}
            {@render summary()}
        {:else}
            {label}
        {/if}
    </summary>
    {@render children()}
</details>
