<script>
    import Button from "../control/button.svelte"
    import Icon from "../info/icon.svelte"
    import Paper from "../layout/paper.svelte"
    import Table from "../data-display/table.svelte"
    import Text from "../text.svelte"

    import Grid from "../layout/grid.svelte"

    import wsx from "../wsx.mjs"

    export let color = false
    export let fillHeader = true
    export let data = []
    export let pageSize = 10
    export let page = 0
    export let rowHeight = "40px"

    $: rows = Array.from(
        { length: pageSize },
        (_, i) => data[page * pageSize + i]
    )
    $: rowCount = data?.length ?? 0
    $: pageCount = Math.ceil(rowCount / pageSize)
    $: maxPage = Math.max(pageCount - 1, 0)

    const prev = () => page = Math.max(0, page - 1)
    const next = () => page = Math.min(maxPage, page + 1)
</script>

<Paper card {color} l-fl.cross="stretch" l-p="0px">
    <Table data={rows} {color} {fillHeader} {...$$restProps}>
        <slot slot="header" let:colNames>
            <tr ws-x="h[{rowHeight}]">
                <slot name="header">
                    <th>No Header Template</th>
                </slot>
            </tr>
        </slot>
        <slot slot="row" let:row let:colNames>
            <tr ws-x="h[{rowHeight}]">
                <slot name="row" {row}>
                    <td>No Row Template</td>
                </slot>
            </tr>
        </slot>
        <slot slot="empty-row">
            <tr ws-x="h[{rowHeight}]">
                <slot name="empty-row" />
            </tr>
        </slot>
    </Table>
    <Grid slot="footer" gr.cols="min-content min-content min-content 1fr">
        <Button on:click={prev} disabled={page === 0}>
            <Icon name="arrow-big-left" />
        </Button>
        <Button on:click={next} disabled={page === maxPage}>
            <Icon name="arrow-big-right" />
        </Button>
        <Text adorn t.ws="nowrap">
            {#if pageCount !== 0}
                Page {page + 1} / {pageCount}
            {/if}
        </Text>
    </Grid>
</Paper>
