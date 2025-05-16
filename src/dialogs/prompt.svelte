<script>
    import Button from "../control/button.svelte"
    import Dialog from "../layout/dialog.svelte"
    import Grid from "../layout/grid.svelte"
    import Icon from "../info/icon.svelte"
    import Input from "../control/input.svelte"
    import Text from "../text.svelte"
    import Titlebar from "../info/titlebar.svelte"
    import { modalContext } from "../layout/modal.svelte"

    import { handler$ } from "../handler$.js"
    import { frameDelay } from "../internals.js"

    let {
        title: titleText = "Confirm",
        icon,
        message,
        okText = "OK",
        cancelText = "Cancel",
        color = "@default",
        value = $bindable(""),
        initial = ""
    } = $props()

    const { close } = modalContext()
    const cls = handler$(close)
    let input = $state(null)

    const done = (evt) => {
        evt.preventDefault()
        evt.stopPropagation()
        close(true)
    }

    // the first 1-2 frames it's in the DOM it's not visible, focus didn't work
    frameDelay(3, () => input.focus())
    value = initial
</script>

<Dialog card {color}>
    {#snippet header()}
    <Titlebar {color}>
        {#snippet title()}
        <Text title>
            <Icon name={icon}>
                {titleText}
            </Icon>
        </Text>
        {/snippet}
    </Titlebar>
    {/snippet}

    <form onsubmit={done} ws-x="[grid]">
        <Input bind:value {color} bind:this={input} label={message} />
    </form>

    {#snippet footer()}
    <Grid cols="1fr 1fr" p="0px">
        <Button onclick={cls(false)} color="@danger" ground>
            {cancelText}
        </Button>
        <Button onclick={cls(true)} color="@secondary" ground>
            {okText}
        </Button>
    </Grid>
    {/snippet}
</Dialog>
