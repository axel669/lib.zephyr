<script>
    import { Paper, Tabs, Text, Titlebar, Grid } from "@axel669/zephyr"
</script>

<Grid cols="1fr 1fr">
    <Paper l-gap="12px">
        {#snippet header()}
        <Titlebar>
            {#snippet title()}
            <Text title>
                Some Title
            </Text>
            {/snippet}
        </Titlebar>
        {/snippet}

        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
    </Paper>

    <Paper card>
        {#snippet header()}
        <Titlebar>
            {#snippet title()}
            <Text title>
                Some Other Title
            </Text>
            {/snippet}
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

    <Paper card color="@primary">
        {#snippet header()}
        <Titlebar fill color="@primary">
            {#snippet title()}
            <Text title>
                Some Title
            </Text>
            {/snippet}
        </Titlebar>
        {/snippet}

        <div>Content</div>
    </Paper>
</Grid>
