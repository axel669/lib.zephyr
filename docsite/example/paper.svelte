<script>
    import {
        Paper,

        Grid,
        Text,
        Titlebar,
    } from "@axel669/zephyr"
</script>

<Grid ws="gr.cols: 1fr 1fr;">
    <Paper layoutWS="gap: 12px;">
        {#snippet header()}
        <Titlebar>
            <Text title>
                Some Title
            </Text>
        </Titlebar>
        {/snippet}

        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
    </Paper>

    <Paper ws="variant.outline;">
        {#snippet header()}
        <Titlebar>
            <Text title>
                Some Other Title
            </Text>
        </Titlebar>
        {/snippet}

        {#snippet content()}
        <Paper>
            <div>Content 1</div>
            <div>Content 2</div>
            <div>Content 3</div>
        </Paper>
        {/snippet}

        {#snippet footer()}
        <div ws-x="[b 2px solid @text-color-normal] [p 4px]">
            Wat
        </div>
        {/snippet}
    </Paper>

    <Paper ws="variant.outline; @color: @primary;">
        {#snippet header()}
        <Titlebar ws="variant.fill; @color: @primary;">
            <Text title>
                Some Title
            </Text>
        </Titlebar>
        {/snippet}

        <div>Content</div>
    </Paper>
</Grid>
