<script>
    import wsx from "../wsx.js"

    const {
        color = "@default",
        data = [],
        fillHeader = false,
        stickyHeader = false,
        cols = "1fr",
        header,
        row,
        emptyRow,
        ...rest
    } = $props()

    const wind = $derived({
        "$color": color,
        "$fill-header": fillHeader,
        "$sticky-header": stickyHeader,
        "gr.cols": cols,
        ...rest,
    })
</script>

<table use:wsx={wind}>
    <thead>
        {#if header}
            {@render header()}
        {:else}
            <tr>
                <th>No Header Template</th>
            </tr>
        {/if}
    </thead>
    <tbody>
        {#each data as rowValue, rowNum}
            {#if rowValue === undefined}
                {@render emptyRow(rowNum)}
            {:else}
                {#if row}
                    {@render row(rowValue, rowNum)}
                {:else}
                    <tr>
                        <td>No Row Template</td>
                    </tr>
                {/if}
            {/if}
        {/each}
    </tbody>
</table>
