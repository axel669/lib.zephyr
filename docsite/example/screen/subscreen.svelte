<script>
    import {
        Screen,
        Paper,
        Titlebar,
        Text,
        Button,
    } from "@axel669/zephyr"

    const { close } = $props()
</script>

<Screen>
    <Paper card square>
        {#snippet header()}
        <Titlebar>
            {#snippet title()}
            <Text title>
                Subscreen Demo
            </Text>
            {/snippet}

            {#snippet action()}
            <Button onclick={() => close("done")}>
                Close
            </Button>
            {/snippet}
        </Titlebar>
        {/snippet}

        <Text>
            This is area intentially left blank
        </Text>

        {#snippet footer()}
        <Titlebar>
            {#snippet title()}
            <Text subtitle>
                This area was an accident
            </Text>
            {/snippet}
        </Titlebar>
        {/snippet}
    </Paper>
</Screen>
