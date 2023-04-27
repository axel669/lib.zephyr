<script>
    import Button from "../button.svelte"
    import Dialog from "../dialog.svelte"
    import Grid from "../grid.svelte"
    import Icon from "../icon.svelte"
    import Text from "../text.svelte"
    import Titlebar from "../titlebar.svelte"

    import { handler$ } from "../handler$.mjs"

    export let close
    export let title = "Confirm"
    export let icon
    export let message
    export let okText = "OK"
    export let cancelText = "Cancel"
    export let color = "primary"

    const cls = handler$(close)
</script>

<Dialog card {color}>
    <Titlebar slot="header" {color}>
        <Text title slot="title">
            <Icon name={icon}>
                {title}
            </Icon>
        </Text>
    </Titlebar>

    <Text>
        {message}
    </Text>

    <Grid cols="1fr 1fr" slot="footer" pad="0px">
        <Button on:click={cls(false)} color="danger">
            {cancelText}
        </Button>
        <Button on:click={cls(true)} color="secondary">
            {okText}
        </Button>
    </Grid>
</Dialog>
