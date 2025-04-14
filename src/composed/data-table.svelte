<script module>
    const itemRange = (info) => {
        const {
            scrollPos,
            scrollMax,
            rowSize,
            length,
            containerHeight,
        } = info
        if (scrollMax === null) {
            return [0, 0]
        }
        const displayed = Math.ceil(containerHeight / rowSize) - 1
        const itemPos = Math.floor(
            (scrollPos / scrollMax) * (length - displayed)
        )
        return [
            itemPos - 1,
            itemPos + displayed + 1,
            displayed + 2,
        ]
    }
    const emptyRow = Symbol("empty row")
    const nullRow = Symbol("null row")

    const sliceData = (data, range) => {
        const displayed = data.slice(
            Math.max(range[0], 0),
            range[1]
        )
        if (range[0] === -1) {
            return [emptyRow, ...displayed]
        }
        if (displayed.length < range[2]) {
            return [
                ...displayed,
                ...Array.from(
                    { length: range[2] - displayed.length },
                    () => nullRow
                )
            ]
        }
        return displayed
    }
</script>

<script>
    import { on } from "svelte/events"

    import Grid from "../layout/grid.svelte"

    import wsx from "../wsx.js"

    const {
        data,
        rowSize = 40,
        headerSize = rowSize,
        cols = "1fr",
        gap = 2,
        colGap = gap,
        rowGap = gap,
        header,
        row,
        color,
        fillHeader = false,
        ...rest
    } = $props()

    const rowPx = rowSize + rowGap
    const height = $derived(
        rowPx * data.length - rowGap
    )
    const tableHeight = $derived(height + rowPx)

    let scrollPos = $state(0)
    let scrollMax = $state(null)
    let containerHeight = $state(null)
    const scrollHandler = (evt) => {
        scrollPos = container.scrollTop
    }
    const range = $derived(
        itemRange({
            scrollPos,
            scrollMax,
            containerHeight,
            rowSize: rowSize + rowGap,
            length: data.length,
        })
    )
    let container = $state(null)

    $effect(() => {
        containerHeight = container.clientHeight
        scrollMax = container.scrollHeight - containerHeight
        on(container, "scroll", scrollHandler, { passive: true })
        const observer = new ResizeObserver(
            () => {
                containerHeight = container.clientHeight
                scrollMax = container.scrollHeight - containerHeight
            }
        )
        observer.observe(container)
        return () => observer.unobserve(container)
    })

    const displayed = $derived(range[2])
    const displayedRows = $derived(
        sliceData(data, range)
    )
    const tbodyHeight = $derived(displayRows.length * rowSize)

    const tableWSX = $derived({
        "$fill-header": fillHeader,
        $color: color,
        "gr.cols": cols,
        "gap.col": `${colGap}px`,
        "gap.row": `${rowGap}px`,
        "@header-size": `${headerSize}px`,
        "@row-size": `${rowSize}px`,
        "$sticky-header": true,
        w: "100%",
        h: `${tableHeight}px`,
        over: "visible",
        con: "paint",
    })
    const tbodyWSX = $derived({
        disp: "grid",
        "gr.rows": "subgrid",
        "gr.cols": "subgrid",
        row: `span ${displayed}`,
        tf: `translateY(${range[0] * rowPx}px)`,
    })
    const footerWSX = $derived({
        h: "40px",
        bg: "@background-element",
        $color: color,
        "b.y": "2px solid @ripple-base-color",
        disp: "flex",
        "fl-center": true,
    })

    const show = $derived({
        start: Math.max(1, range[0] + 2),
        end: Math.min(data.length, range[1] - 1),
        total: data.length,
    })
</script>

<Grid cols="1fr" rows="1fr min-content" pos="relative" {...rest} gap="0px">
    <div ws-x="[over auto]" bind:this={container}>
        <table use:wsx={tableWSX}>
            <thead>
                {@render header()}
            </thead>
            <tbody use:wsx={tbodyWSX}>
                {#each displayedRows as dataRow}
                    {#if dataRow === nullRow}
                        <tr>
                            <td ws-x="[col 1 / -1]"></td>
                        </tr>
                    {:else if dataRow === emptyRow}
                        <tr></tr>
                    {:else}
                        {@render row(dataRow)}
                    {/if}
                {/each}
            </tbody>
        </table>
    </div>

    <div use:wsx={footerWSX}>
        Showing: {show.start} - {show.end} of {show.total}
    </div>
</Grid>
