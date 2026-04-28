<script>
    import {
        Titlebar,

        Button,
        Paper,
        Text,
        Icon,
        Flex,
    } from "@axel669/zephyr"
</script>

<Flex>
    <Titlebar>
        <Text size="title">
            Some Title
        </Text>

        {#snippet menu()}
        <Button>
            <Icon name="list" />
        </Button>
        {/snippet}
    </Titlebar>

    <Paper ws="variant.outline; @color: @success;">
        {#snippet header()}
        <Titlebar ws="@color: @success;">
            <Text size="title">
                Paper Title
                <Text subtitle>
                    Indented Subtitle
                </Text>
            </Text>

            {#snippet menu()}
            <Button>
                <Icon name="list" />
            </Button>
            {/snippet}
        </Titlebar>
        {/snippet}

        <Text>Content</Text>
    </Paper>

    <Paper ws="variant.outline; @color: @info;">
        {#snippet header()}
        <Titlebar ws="variant.fill; @color: @info;">
            <Flex p="0px">
                <Text size="title">
                    Paper Title
                </Text>
                <Text subtitle>
                    Aligned Subtitle
                </Text>
            </Flex>

            {#snippet action()}
            <Button>
                Save
            </Button>
            {/snippet}
        </Titlebar>
        {/snippet}

        <Text>Content</Text>
    </Paper>
</Flex>
