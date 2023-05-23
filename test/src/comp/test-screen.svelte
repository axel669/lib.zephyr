<script>
    import {
        Button,
        Icon,
        Paper,
        Screen,
        Titlebar,
        Text,
    } from "@axel669/svelte-wind"

    export let close
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
    </Paper>
</Screen>
