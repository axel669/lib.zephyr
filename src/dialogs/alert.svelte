<script>
    import Button from "../control/button.svelte"
    import Dialog from "../layout/dialog.svelte"
    import Icon from "../info/icon.svelte"
    import Text from "../text.svelte"
    import Titlebar from "../info/titlebar.svelte"

    const {
        close,
        color = "@primary",
        icon,
        message,
        okText = "OK",
        titleText = "Alert",
    } = $props()
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
    <Button onclick={close} {color} ground>
        {okText}
    </Button>
    {/snippet}
</Dialog>
