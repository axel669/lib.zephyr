<script>
    import wsx from "./wsx.mjs"

    export let color = false
    export let data = []
    export let cols = []
    export let rowWSX = null
    export let cellWSX = null

    $: wind = {
        $color: color,
        ...$$restProps,
    }
</script>

<table use:wsx={wind}>
    <thead>
        <tr>
            {#each cols as col}
                <th use:wsx={{ w: col.width }}>{col.label}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each data as row, rowNum}
            <tr use:wsx={rowWSX?.(row, rowNum)}>
                {#each row as cell, colNum}
                    <td use:wsx={cellWSX?.(cell, rowNum, colNum)}>
                        {cell}
                    </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
