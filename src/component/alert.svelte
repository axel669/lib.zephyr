<script>
    import Button from "./button.svelte"
    import Paper from "./paper.svelte"
    import Text from "./text.svelte"
    import Titlebar from "./titlebar.svelte"

    const {
        message,
        close,
    } = $props()
</script>

<Paper ws="@color: @primary; variant.outline;">
    {#snippet header()}
        <Titlebar ws="@color: @primary;">
            <Text header>
                Alert
            </Text>
        </Titlebar>
    {/snippet}

    <Text>
        {message}
    </Text>

    {#snippet footer()}
        <Button ws="@color: @success;" onclick={() => close(true)}>
            OK
        </Button>
    {/snippet}
</Paper>
