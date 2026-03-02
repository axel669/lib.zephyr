<script>
    import { onMount } from "svelte"

    import Button from "./button.svelte"
    import Grid from "./grid.svelte"
    import Paper from "./paper.svelte"
    import Text from "./text.svelte"
    import Titlebar from "./titlebar.svelte"
    import ControlLabel from "./control-label.svelte"

    const {
        message,
        close,
        color = "@primary",
        okText = "OK",
        cancelText = "Cancel",
        title = "Prompt",
    } = $props()

    let value = $state("")
    let input = $state(null)
    onMount(() => input.focus())
    const done = (e) => {
        e.preventDefault()
        close(value)
    }
</script>

<Paper ws="@color: {color}; variant.outline;">
    {#snippet header()}
        <Titlebar ws="@color: {color};">
            <Text header>
                {title}
            </Text>
        </Titlebar>
    {/snippet}

    <Text ws="p: 8px;">
        {message}
    </Text>

    <form onsubmit={done} data-ws="grid;">
        <ControlLabel ws="@color: {color};">
            <input type="text" bind:value bind:this={input} />
        </ControlLabel>
    </form>

    {#snippet footer()}
        <Grid ws="gr.cols: 1fr 1fr; p: 0px;">
            <Button ws="@color: @error;" onclick={() => close(false)}>
                {cancelText}
            </Button>
            <Button ws="@color: @success;" onclick={() => close(value)}>
                {okText}
            </Button>
        </Grid>
    {/snippet}
</Paper>
