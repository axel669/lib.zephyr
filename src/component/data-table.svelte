<script module>
    import { ws as wind } from "../ws.js"

    wind.component("ze-data-table")`
        pos.rel;
        grid;
        gr.cols: 1fr;
        gr.rows: 1fr min-content;
        p: 0px;
        h: 100%;
        w: 100%;
        h.max: 100%;
        w.max: 100%;
    `
    wind.component("ze-data-scroller")`
        pos.rel;
        over: auto;
        ! &::before {
            *content: "";
            pos.abs;
            w: 1px;
            h: @h;
            z: -1;
        }
    `
    wind.component("ze-fake-scroll")`
        disp: block;
        w: 100%;
        h: @h;
        pos.stick;
        y: 0px;
        over: hidden;
    `
    wind.component("ze-data-footer")`
        pos: rel;
        grid;
    `

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
    import { onMount } from "svelte"
    import { on } from "svelte/events"

    const {
        rowSize = 30,
        headerSize = rowSize,
        header = Header,
        row = Row,
        ws = "",
        data,
        footer = Footer,
    } = $props()

    const keys = $derived(
        Object.keys(data?.[0] ?? {})
    )

    const itemsHeight = $derived(
        rowSize * data.length
    )
    const tableHeight = $derived(itemsHeight + headerSize)

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
            rowSize,
            length: data.length,
        })
    )
    let container = $state(null)

    $inspect(scrollMax, containerHeight)

    onMount(() => {
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
    const show = $derived({
        start: Math.max(1, range[0] + 2),
        end: Math.min(data.length, range[1] - 1),
        total: data.length,
    })
    const correction = $derived(
        (data.length - displayed) * rowSize
    )

    const itemOffset = $derived(
        range[0] * rowSize - scrollPos
    )

    const containerWS = $derived(
        wind.x({
            "! & :where(thead, tbody)": {
                w: "100%",
            },
            "! & thead > tr": {
                h: "@header",
                z: "+5",
                "pos.rel": true,
            },
            "! & tbody > tr": {
                h: "@row",
            },
        })
    )
</script>

{#snippet Header(keys)}
    <tr>
        {#each keys as key}
            <th>{key}</th>
        {/each}
    </tr>
{/snippet}
{#snippet Row(item, keys)}
    <tr>
        {#each keys as key}
            <td>{item[key]}</td>
        {/each}
    </tr>
{/snippet}
{#snippet Footer(show, displayed)}
    <div data-ws="flex; fl.cn; h.min: 32px;">
        <div>
            Showing: {show.start} - {show.end} of {show.total}
        </div>
    </div>
{/snippet}

<ze-data-table data-ws={containerWS}>
    <ze-data-scroller
    bind:this={container}
    data-ws="@h: {tableHeight}px; @header: {headerSize}px; @row: {rowSize}px;"
    >
        <ze-fake-scroll data-ws="@h: {containerHeight}px;">
            <table data-ws="w: 100%; {ws}">
                <thead>
                    {#if data?.length > 0}
                        {@render header(keys)}
                    {:else}
                        <tr>
                            <td>N/A</td>
                        </tr>
                    {/if}
                </thead>
                <tbody data-ws="tf: translateY({itemOffset}px);">
                    {#each displayedRows as item}
                        {@render row(item, keys)}
                    {:else}
                        <tr>
                            <td>No Items</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </ze-fake-scroll>
    </ze-data-scroller>

    <ze-data-footer>
        {@render footer(show, displayedRows)}
    </ze-data-footer>
</ze-data-table>
