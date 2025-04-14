<script>
    import Button from "../control/button.svelte"
    import Dialog from "../layout/dialog.svelte"
    import Grid from "../layout/grid.svelte"
    import Icon from "../info/icon.svelte"
    import Text from "../text.svelte"
    import Titlebar from "../info/titlebar.svelte"

    import { handler$ } from "../handler$.js"

    const {
        close,
        titleText = "Confirm",
        icon,
        message,
        okText = "OK",
        cancelText = "Cancel",
        color = "@primary",
    } = $props()

    const cls = handler$(close)
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

    <Text>
        {message}
    </Text>

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
