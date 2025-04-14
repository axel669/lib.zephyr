<script>
    import { Drawer, Titlebar, Text } from "@axel669/zephyr"

    const {
        close,
        type,
    } = $props()

    export const cancel = () => close()
</script>

<Drawer {type}>
    {#snippet header()}
    <Titlebar>
        {#snippet title()}
        <Text title>
            Some Title
        </Text>
        {/snippet}
    </Titlebar>
    {/snippet}

    <Text>Content</Text>
</Drawer>
