<script>
    import { createEventDispatcher } from "svelte"

    import Button from "../../button.svelte"
    import Icon from "../../icon.svelte"
    import Notification from "../../notification.svelte"

    export let message = ""
    export let icon = ""
    export let color = false
    export let actionText = null

    const dispatch = createEventDispatcher()
    const dismiss = () => dispatch("action", null)
    const respond = () => dispatch("action", true)
</script>

<Notification {color} on:click={dismiss}>
    <Icon name={icon}>{message}</Icon>
    {#if actionText}
        <Button {color} variant="fill" on:click={respond}>
            {actionText}
        </Button>
    {/if}
</Notification>
