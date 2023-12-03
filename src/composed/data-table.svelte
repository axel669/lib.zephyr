<svelte:options immutable />

<script context="module">
    // find the first filter in the list that returns false
    const applyFilters = (data, filters, filterInput) => data.filter(
        (row) => {
            for (const [filter, index] of filters) {
                if (filter(filterInput[index], row) === false) {
                    return false
                }
            }
            return true
        }
    )

    export const filters = {
        text: (propName) =>
            (text, row) =>
                row[propName]
                .toLowerCase()
                .includes(text.toLowerCase())
    }
</script>

<script>
    import { createEventDispatcher } from "svelte"
    import { writable } from "svelte/store"

    import Button from "../control/button.svelte"
    import Icon from "../info/icon.svelte"
    import Paper from "../layout/paper.svelte"
    import Table from "../data-display/table.svelte"
    import Text from "../text.svelte"
    import TextInput from "../control/input/text.svelte"

    import Grid from "../layout/grid.svelte"

    import wsx from "../wsx.mjs"
    import { handler$, eventHandler$ } from "../handler$.mjs"

    export let color = false
    export let fillHeader = true
    export let data = []
    export let cols = []
    export let pageSize = 10
    export let page = 0
    export let rowHeight = "40px"

    $: rows = Array.from(
        { length: pageSize },
        (_, i) => filteredData[page * pageSize + i]
    )
    $: rowCount = filteredData.length
    $: pageCount = Math.ceil(rowCount / pageSize)
    $: maxPage = Math.max(pageCount - 1, 0)

    $: filterInput = cols.map(() => "")
    $: filterFunctions =
        cols.map(
            (col, index) => [col.filter, index]
        )
        .filter(
            (pair) => pair[0] !== undefined
        )
    $: filteredData = applyFilters(data, filterFunctions, filterInput)

    $: console.log(filterInput)

    const prev = () => page = Math.max(0, page - 1)
    const next = () => page = Math.min(maxPage, page + 1)

    const fire = createEventDispatcher()
    const pass = handler$(
        (row) => fire("row-click", row)
    )

    const fuckSvelte = eventHandler$(
        (event, index) => {
            filterInput[index] = event.target.value
            filterInput = [...filterInput]
        }
    )
</script>

<Paper card {color} l-fl.cross="stretch" l-p="0px">
    <Table data={rows} {color} {fillHeader} {...$$restProps}>
        <svelte:fragment slot="header" let:colNames>
            <tr ws-x="h[{rowHeight}]">
                {#each cols as col, colNum}
                    <th use:wsx={{p: "0px", ...col.wsx}}>
                        {#if col.sort === true}
                            <Button compact r="0px" w="100%" color="primary"
                            h="calc({rowHeight} - 1px)" fill={fillHeader}
                            t.wt="inherit">
                                <Icon
                                    name="arrows-up-down"
                                    m.r="8px"
                                    t.sz="16px"
                                />
                                <slot name="header-label" {col} {colNum}>
                                    {col.label ?? ""}
                                </slot>
                            </Button>
                        {:else}
                            <slot name="header-label" {col} {colNum}>
                                {col.label ?? ""}
                            </slot>
                        {/if}
                    </th>
                {/each}
            </tr>
            <tr>
                {#each cols as col, colNum}
                    {#if col.filter !== undefined}
                        <th ws-x="p[0px]">
                            <Grid p="2px" gap="2px" cols="min-content 1fr">
                                <Icon name="filter" />
                                <input
                                    type="text"
                                    ws-x="w.min[30px] w[100%]
                                    outline:focus[none] p[2px] r[2px]"
                                    on:input={fuckSvelte(colNum)}
                                />
                            </Grid>
                        </th>
                    {:else}
                        <th ws-x="p[0px]"></th>
                    {/if}
                {/each}
            </tr>
        </svelte:fragment>
        <tr ws-x="h[{rowHeight}]" slot="row" let:row let:rowNum>
            {#each cols as col, colNum}
                <slot name="data-cell" {row} {rowNum} {col} {colNum}>
                    <td>
                        {row[colNum] ?? row[col.prop] ?? ""}
                    </td>
                </slot>
            {/each}
        </tr>
        <tr ws-x="h[{rowHeight}]" slot="empty-row" />
    </Table>
    <Grid slot="footer" gr.cols="min-content min-content min-content 1fr">
        {#if pageCount > 1}
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
        {/if}
    </Grid>
</Paper>
