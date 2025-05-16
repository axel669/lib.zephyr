<script>
    import { Drawer, Titlebar, Text, modalContext } from "@axel669/zephyr"

    const {
        type,
    } = $props()

    const { close } = modalContext()
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
