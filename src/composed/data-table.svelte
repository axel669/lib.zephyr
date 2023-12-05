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
    const noSort = {
        direction: null,
        func: (a, b) => 0,
        base: null,
    }

    export const dtContext = Symbol("table key")
</script>

<script>
    import { createEventDispatcher, setContext } from "svelte"
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
    let sorting = noSort
    $: filteredData =
        applyFilters(data, filterFunctions, filterInput)
        .sort(sorting.func)

    const prev = () => page = Math.max(0, page - 1)
    const next = () => page = Math.min(maxPage, page + 1)

    const updateSort = (func) => {
        if (sorting.base === func) {
            if (sorting.direction === "desc") {
                sorting = noSort
                return
            }
            sorting = {
                func: (a, b) => -func(a, b),
                base: func,
                direction: "desc"
            }
            return
        }
        sorting = {
            func,
            base: func,
            direction: "asc",
        }
    }

    const context = writable({})
    $: $context = {
        updateSort,
        fillHeader,
        sorting,
    }
    setContext(dtContext, context)

    const fire = createEventDispatcher()
    const pass = handler$(
        (row) => fire("row-click", row)
    )
</script>

<Paper card {color} l-fl.cross="stretch" l-p="0px">
    <Table data={rows} {color} {fillHeader} {...$$restProps}>
        <tr ws-x="h.min[{rowHeight}]" slot="header">
            <slot name="header">
                <th>No Header Defined</th>
            </slot>
        </tr>
        <tr ws-x="h[{rowHeight}]" slot="row" let:row>
            <slot name="row" {row}>
                <th>No Row Defined</th>
            </slot>
        </tr>
        <tr ws-x="h[{rowHeight}]" slot="empty-row" />
    </Table>
    <Grid slot="footer" gr.cols="min-content min-content min-content 1fr">
        {#if pageCount > 0}
            <Button on:click={prev} disabled={page === 0}>
                <Icon name="arrow-big-left" />
            </Button>
            <Button on:click={next} disabled={page === maxPage}>
                <Icon name="arrow-big-right" />
            </Button>
            <Text adorn t.ws="nowrap">
                Page {page + 1} / {pageCount}
            </Text>
        {/if}
    </Grid>
</Paper>
