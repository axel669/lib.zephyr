<script>
    import wsx from "../wsx.mjs"

    export let color = false
    export let fillHeader = false
    export let data = []

    $: header = data?.[0] ?? {}
    $: colNames = Object.keys(header)
    $: wind = {
        "$color": color,
        "$header-fill": fillHeader,
        ...$$restProps,
    }
</script>

<table use:wsx={wind}>
    <thead>
        <slot name="header">
            <tr>
                {#each colNames as columnName}
                    <th>{columnName}</th>
                {:else}
                    <th>No Data</th>
                {/each}
            </tr>
        </slot>
    </thead>
    <tbody>
        {#each data as row}
            <slot name="row" {row}>
                <tr>
                    {#each colNames as key}
                        <td>{row[key] ?? ""}</td>
                    {/each}
                </tr>
            </slot>
        {/each}
    </tbody>
</table>
