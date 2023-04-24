<script>
    /*md
    [@] Components/Data Display/DataTable

    # DataTable

    The DataTable is a more advanced way to show data on screen. Underneath is
    a table element like the Table component, but the DataTable supports
    more fine-grained control over how data is passed, how rows are displayed,
    and pagination.

    > If pagination is not needed, the DataTable may not be necessary as it will
    > only be shortcutting data formatting at that point.

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color
        Sets `$color`
    - ### cols `Array`
        The columns that should be displayed. Should be in the format of
        `{ label, width?, format?, prop? }`. If a format function is provided,
        it is called on each cell to determine a cells value as
        `format(rowItem)`, otherwise the property defined in prop will be used
        as the cell value.
    - ### data `Array`
        The data to display. Each item in the array can be in either the same
        format as the Table, or any kind of object if column format functions
        are used.
    - ### cellWSX `function`
        If given, this function will be called for each cell, and should return
        an object that will be passed to the `wsx` action for each <td>
        generated. The function is passed `(rowvalue, rowNum, col)`.
    - ### rowWSX `function`
        If given, this function will be called for each row, and should return
        an object that will be passed to the `wsx` action for each <tr>
        generated. The function is passed `(rowValue, rowNum)`.
    - ### page
        The current page of data being viewed. Can be bound, or set to control
        which page is displayed
    - ### pageSize
        The number of items to show on each page. Default is 10
    - ### rowHeight
        The height of each row. Can be set individually through rowWSX, but
        that may lead to a degraded user experience if the rows change size
        while paging through the data

    ## Usage
    ```js
    let page
    const cols = [
        { label: "N", prop: "a" },
        { label: "Squared", prop: "b" },
        { label: "Cubed", format: row => `^3 = ${row.c}` },
    ]
    const data = [
        { a: 1, b: 1 ** 2, c: 1 ** 3 },
        { a: 2, b: 2 ** 2, c: 2 ** 3 },
        { a: 3, b: 3 ** 2, c: 3 ** 3 },
        { a: 4, b: 4 ** 2, c: 4 ** 3 },
        { a: 5, b: 5 ** 2, c: 5 ** 3 },
        { a: 6, b: 6 ** 2, c: 6 ** 3 },
        { a: 7, b: 7 ** 2, c: 7 ** 3 },
        { a: 8, b: 8 ** 2, c: 8 ** 3 },
        { a: 9, b: 9 ** 2, c: 9 ** 3 },
        { a: 10, b: 10 ** 2, c: 10 ** 3 },
        { a: 11, b: 11 ** 2, c: 11 ** 3 },
        { a: 12, b: 12 ** 2, c: 12 ** 3 },
        { a: 13, b: 13 ** 2, c: 13 ** 3 },
    ]
    ```
    ```svelte
    <DataTable {cols} {data} color="warning" pageSize={3} bind:page />
    ```
    */

    import Button from "../button.svelte"
    import Icon from "../icon.svelte"
    import Paper from "../paper.svelte"
    import Text from "../text.svelte"

    import Grid from "../grid.svelte"

    import wsx from "../wsx.mjs"

    export let color = false
    export let data = []
    export let cols = []
    export let rowWSX = null
    export let cellWSX = null
    export let pageSize = 10
    export let page = 0
    export let rowHeight = "40px"

    $: wind = {
        $color: color,
        ...$$restProps,
    }

    $: rows = Array.from(
        { length: pageSize },
        (_, i) => data[page * pageSize + i]
    )
    $: pageCount = Math.ceil(data.length / pageSize)

    const prev = () => page = Math.max(0, page - 1)
    const next = () => page = Math.min(pageCount - 1, page + 1)
</script>

<Paper card {color} lprops={{ "fl-cr-a": "stretch", p: "0px" }}>
    <table use:wsx={wind}>
        <thead>
            <tr>
                {#each cols as col}
                    <th use:wsx={{ w: col.width, h: rowHeight }}>{col.label}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each rows as row, rowNum}
                {#if row === undefined}
                    <tr use:wsx={{ h: rowHeight }}></tr>
                {:else}
                    <tr use:wsx={{ h: rowHeight, ...rowWSX?.(row, rowNum) }}>
                        {#each cols as col, colNum}
                            <td use:wsx={cellWSX?.(row, rowNum, col)}>
                                {(col.format !== undefined)
                                    ? col.format?.(row)
                                    : row[col.prop]
                                }
                            </td>
                        {/each}
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
    <Grid slot="footer" gr-col="min-content min-content min-content 1fr">
        <Button on:click={prev}>
            <Icon name="arrow-big-left" />
        </Button>
        <Button on:click={next}>
            <Icon name="arrow-big-right" />
        </Button>
        <Text adorn t-ws="nowrap">
            Page {page + 1} / {pageCount}
        </Text>
    </Grid>
</Paper>
