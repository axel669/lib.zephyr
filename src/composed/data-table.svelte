<script>
    import Button from "../control/button.svelte"
    import Icon from "../info/icon.svelte"
    import Paper from "../layout/paper.svelte"
    import Text from "../text.svelte"

    import Grid from "../layout/grid.svelte"

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
        "$color": color,
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

<Paper card {color} l-fl.cross="stretch" l-p="0px">
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
