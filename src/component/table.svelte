<script>
    const {
        data,
        row = Row,
        header = Header,
        ws = "",
        sticky = false
    } = $props()

    const keys = $derived(
        Object.keys(data?.[0] ?? {})
    )
</script>

{#snippet Header(keys)}
    <tr>
        {#each keys as key}
            <th>{key}</th>
        {/each}
    </tr>
{/snippet}
{#snippet Row(item, keys)}
    <tr>
        {#each keys as key}
            <td>{item[key]}</td>
        {/each}
    </tr>
{/snippet}

<table data-ws={ws} sticky-header={sticky || null}>
    <thead>
        {#if data?.length > 0}
            {@render header(keys)}
        {:else}
            <tr>
                <th>N/A</th>
            </tr>
        {/if}
    </thead>
    <tbody>
        {#each data as item, rowNum}
            {@render row(item, keys, rowNum)}
        {:else}
            <tr>
                <td>No Items</td>
            </tr>
        {/each}
    </tbody>
</table>
