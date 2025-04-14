<script>
    import {
        Toast,
        Button,
        Text,
        Icon,
        Grid
    } from "@axel669/zephyr"
</script>

<Grid cols="1fr 1fr">
    <Toast>
        <Icon name="hexagon">
            Icon with the notif text
        </Icon>
    </Toast>
    <Toast>
        {#snippet start()}
        <Text adorn>
            <Icon name="hexagon" />
        </Text>
        {/snippet}

        <Text>
            Icon outside the notif text
        </Text>
    </Toast>

    <Toast color="@danger">
        {#snippet start()}
        <Text adorn>
            <Icon name="hexagon" />
        </Text>
        {/snippet}

        <Text>
            Danger!
        </Text>

        {#snippet end()}
        <Button ground>
            Fix!
        </Button>
        {/snippet}
    </Toast>
    <Toast color="@primary">
        {#snippet start()}
        <Button ground>
            Fix!
        </Button>
        {/snippet}

        <Text>
            Reverse the slots
        </Text>

        {#snippet end()}
        <Text adorn>
            <Icon name="hexagon" />
        </Text>
        {/snippet}
    </Toast>
</Grid>
