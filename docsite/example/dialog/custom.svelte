<script>
    import { Button, Dialog, Titlebar, Text, modalContext } from "@axel669/zephyr"

    const { close } = modalContext()
</script>

<Dialog>
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

    {#snippet footer()}
        <Button color="@secondary" onclick={() => close()}>
            Close
        </Button>
    {/snippet}
</Dialog>
