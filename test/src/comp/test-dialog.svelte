<script>
    import {
        Dialog,
        Button,
        Icon,
        Text,
        Titlebar,

        Flex,
    } from "@lib"

    export let close
</script>

<Dialog>
    <Titlebar slot="header">
        <Button slot="action" compact on:click={close}>
            <Icon name="x" />
        </Button>
        <Text title slot="title">
            Dialog Test
        </Text>
    </Titlebar>

    <Flex slot="content">
        <Text>First line</Text>
        <Text>Second line</Text>
        <Text>{Math.random()}</Text>
    </Flex>
</Dialog>
