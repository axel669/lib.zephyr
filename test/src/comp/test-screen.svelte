<script>
    import {
        Button,
        Icon,
        Paper,
        Screen,
        Titlebar,
        Text,
    } from "@lib"

    export let close
</script>

<Screen>
    <Titlebar slot="title" fill color="primary">
        <Text slot="title" title>Blep</Text>

        <Button slot="action" on:click={close} color={false} compact>
            <Icon name="x" />
        </Button>
    </Titlebar>

    <Paper slot="content" square>
        <Text slot="content">
            Wat
        </Text>
    </Paper>
</Screen>
