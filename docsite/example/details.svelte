<script>
    import { Details, Icon, Grid } from "@axel669/zephyr"

    let open = $state(false)
</script>

<div>Open: {open}</div>
<Grid ws="gr.cols: 1fr 1fr;">
    <Details label="Info" bind:open>
        Look, more info could go here!
    </Details>

    <Details bind:open ws="@color: @accent; variant.outline;">
        {#snippet summary()}
        <div>
            Slotted labels allowed! <Icon name="hexagon" />
        </div>
        {/snippet}

        Another one!
    </Details>
</Grid>
