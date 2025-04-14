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

<Titlebar>
    {#snippet title()}
    <Text title>
        Some Title
    </Text>
    {/snippet}

    {#snippet menu()}
    <Button>
        <Icon name="list" />
    </Button>
    {/snippet}
</Titlebar>

<Paper card color="@secondary">
    {#snippet header()}
    <Titlebar color="@secondary">
        {#snippet title()}
        <Text title>
            Paper Title
            <Text subtitle>
                Indented Subtitle
            </Text>
        </Text>
        {/snippet}

        {#snippet menu()}
        <Button>
            <Icon name="list" />
        </Button>
        {/snippet}
    </Titlebar>
    {/snippet}
</Paper>

<Paper card color="@secondary">
    {#snippet header()}
    <Titlebar color="@secondary" fill>
        {#snippet title()}
        <Flex p="0px">
            <Text title>
                Paper Title
            </Text>
            <Text subtitle>
                Aligned Subtitle
            </Text>
        </Flex>
        {/snippet}

        {#snippet action()}
        <Button>
            Save
        </Button>
        {/snippet}
    </Titlebar>
    {/snippet}
</Paper>
