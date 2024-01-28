<script>
    import {
        Button,
        Icon,
        Paper,
        Screen,
        Titlebar,
        Text,
        EntryButton,
    } from "@axel669/svelte-wind"

    import TestDialog from "./test-dialog.svelte"

    export let close
    export let closeToTop

    const testDialog = () => ({
        message: Math.random().toString(16)
    })
</script>

<Screen>
    <Paper square>
        <Titlebar slot="header" fill color="primary">
            <Text slot="title" title>Blep</Text>

            <Button slot="action" on:click={close} compact>
                <Icon name="x" />
            </Button>
        </Titlebar>
        <Text>
            Wat
        </Text>
        <Button on:click={closeToTop}>
            Close All
        </Button>
        <EntryButton component={TestDialog} on:entry={console.log} props={testDialog}>
            Test Dialog
        </EntryButton>
    </Paper>
</Screen>
