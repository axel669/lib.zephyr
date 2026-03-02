<script>
    import Button from "./button.svelte"
    import Grid from "./grid.svelte"
    import Paper from "./paper.svelte"
    import Text from "./text.svelte"
    import Titlebar from "./titlebar.svelte"

    const {
        message,
        close,
        color = "@primary",
        okText = "OK",
        cancelText = "Cancel",
    } = $props()
</script>

<Paper ws="@color: {color}; variant.outline;">
    {#snippet header()}
        <Titlebar ws="@color: {color};">
            <Text header>
                Confirm
            </Text>
        </Titlebar>
    {/snippet}

    <Text ws="p: 8px;">
        {message}
    </Text>

    {#snippet footer()}
        <Grid ws="gr.cols: 1fr 1fr; p: 0px;">
            <Button ws="@color: @error;" onclick={() => close(false)}>
                {cancelText}
            </Button>
            <Button ws="@color: @success;" onclick={() => close(true)}>
                {okText}
            </Button>
        </Grid>
    {/snippet}
</Paper>
