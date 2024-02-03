<svelte:options immutable />

<script context="module">
    // find the first filter in the list that returns false
    const applyFilters = (data, filters) => {
        if (Array.isArray(data) === false) {
            return null
        }
        return data.filter(
            (row) => {
                for (const [filter, value] of filters) {
                    if (filter(row, value) === false) {
                        return false
                    }
                }
                return true
            }
        )
    }
    const sliceData = (data, page, pageSize, sortFunc) => {
        if (data === null) {
            return []
        }
        const sorted = data.sort(sortFunc)
        return Array.from(
            { length: pageSize },
            (_, i) => sorted[page * pageSize + i]
        )
    }
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

    import Grid from "../layout/grid.svelte"

    import wsx from "../wsx.mjs"
    import { handler$, eventHandler$ } from "../handler$.mjs"

    export let color = false
    export let fillHeader = true
    export let data
    export let pageSize = 10
    export let page = 0
    export let rowHeight = "40px"
    export let scrollable = false
    export let height = null

    let sorting = noSort
    let filters = new Map()
    let filterFunctions = []
    let jumpTarget = "1"

    $: filteredData = applyFilters(data, filterFunctions)
    $: rows = sliceData(filteredData, page, pageSize, sorting.func)
    $: rowCount = filteredData?.length ?? 0
    $: pageCount = Math.ceil(rowCount / pageSize)
    $: maxPage = Math.max(pageCount - 1, 0)
    $: jumpTarget = (page + 1).toString()

    $: if (filteredData === null) {
        console.warn("DataTable: data is not an array")
    }

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
    const updateFilter = (func, value) => {
        if (func === null) {
            return
        }
        filters.set(func, value)
        filterFunctions = [
            ...filters.entries()
        ]
    }

    const context = writable({})
    $: $context = {
        updateSort,
        fillHeader,
        sorting,
        updateFilter,
    }
    setContext(dtContext, context)

    const fire = createEventDispatcher()
    const pass = handler$(
        (row) => fire("row-click", row)
    )

    let scroller = null
    $: if (scroller !== null && isNaN(page) === false) {
        scroller.scrollTop = 0
    }
    const jump = (evt) => {
        if (evt.type === "keypress" && evt.key !== "Enter") {
            return
        }
        const target = parseInt(evt.target.value)
        if (isNaN(target) === true) {
            jumpTarget = (page + 1).toString()
            return
        }
        page = Math.max(
            Math.min(jumpTarget - 1, maxPage),
            0
        )
        jumpTarget = (page + 1).toString()
    }

    $: content = {
        "fl.cross": "stretch",
        p: "0px",
        gap: "0px",
        over: (scrollable === true) ? "auto" : null,
    }
    $: header = {
        "h.min": rowHeight,
        y: "0px",
        z: "+10",
        pos: (scrollable === true) ? "sticky" : null,
    }
</script>

<Paper {color} h={height}>
    <ws-flex use:wsx={content} slot="content" bind:this={scroller}>
        <Table data={rows} {color} {fillHeader} {...$$restProps} b.t.w="0px">
            <tr use:wsx={header} slot="header">
                <slot name="header">
                    <th>No Header Defined</th>
                </slot>
            </tr>
            <tr ws-x="[h {rowHeight}]" slot="row" let:row>
                <slot name="row" {row}>
                    <th>No Row Defined</th>
                </slot>
            </tr>
            <tr ws-x="[h {rowHeight}]" slot="empty-row" />
        </Table>
    </ws-flex>
    <Grid slot="footer" gr.cols="min-content min-content min-content 1fr"
    rows="32px" b="1px solid @color" b.b.w="4px">
        {#if pageCount > 0}
            <Button on:click={prev} disabled={page === 0}>
                <Icon name="arrow-big-left" />
            </Button>
            <Button on:click={next} disabled={page === maxPage}>
                <Icon name="arrow-big-right" />
            </Button>
            <Text adorn t.ws="nowrap">
                Page
                <input ws-x="[b 1px solid @text-color-normal] [w 36px] [r 4px]
                [h 24px] [bg.c transaprent] [t.a center] [m.l 4px] [m.r 4px]"
                type="text" bind:value={jumpTarget}
                on:keypress={jump} on:blur={jump} />
                / {pageCount}
            </Text>
        {:else}
            <div ws-x="[col span 3] [p.l 4px]">
                No data to show
            </div>
        {/if}
        <slot name="action" />
    </Grid>
</Paper>
