<script>
    /*md
    [@] Components/Data Display/Table

    # Table

    Displays data using html tables with some nice styling. This version of the
    table is fairly simple and intended for basic data displays. For more
    complex data displays the DataTable should be used.

    ## Base
    [Windstorm Table](https://axel669.github.io/lib.windstorm/#components-table)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### cols `Array`
        The columns that should be displayed. Should be in the format of
        `{ label, width? }`
    - ### data `Array[Array]`
        The data to display. The data should be an array where each item is a
        row, and each item in the row is the value for a column.
    - ### cellWSX `function`
        If given, this function will be called for each cell, and should return
        an object that will be passed to the `wsx` action for each <td>
        generated. The function is passed `(cellValue, rowNum, colNum)`.
    - ### rowWSX `function`
        If given, this function will be called for each row, and should return
        an object that will be passed to the `wsx` action for each <tr>
        generated. The function is passed `(rowValue, rowNum)`.
    */

    import wsx from "../wsx.mjs"

    export let color = false
    export let data = []
    export let cols = []
    export let rowWSX = null
    export let cellWSX = null

    $: wind = {
        "$color": color,
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
