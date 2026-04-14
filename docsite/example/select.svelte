<script>
    import { Select, Grid } from "@axel669/zephyr"

    // Results in:
    // <option>first</option>
    // <optgroup label="Not Numbers">
    //     <option>second</option>
    //     <option>third</option>
    // </optgroup>
    const options = [
        { label: "first", value: "1" },
        {
            group: "Grouped",
            items: [
                { label: "second", value: "two" },
                { label: "third", value: "3" },
            ]
        },
    ]
    let value = $state(1)
</script>

<pre>Value: {JSON.stringify(value)}</pre>
<Grid ws="gr.cols: 1fr 1fr;">
    <Select {options} bind:value ws="" />
    <Select {options} bind:value ws="@color: @success; variant.outline;" />

    <!-- Make the custom label only show when a value is selected with WS + blank -->
    <Select {options} bind:value ws="variant.outline;" blank="">
        {#snippet selected()}
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            Custom Label<ws-selected data-ws={"! &:empty { disp: none; } ! &::before { *content: ': '; }"} />
        {/snippet}
    </Select>
    <Select {options} bind:value ws="variant.lined; @color: @info;" />
</Grid>
