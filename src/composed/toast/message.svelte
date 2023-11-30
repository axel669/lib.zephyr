<script>
    /*md
    [@] Components/ToastMessage

    # ToastMessage

    The default component for Toast to show messages with

    ## Props
    - ### actionText `string`
        If given, the message will have a button that can be clicked and will
        use this text for the button text
    - ### color `string`
        Sets `$color`
    - ### icon `string`
        An icon to show with the message
    - ### message `string`
        The message to show
    */

    import { createEventDispatcher } from "svelte"

    import Button from "../../control/button.svelte"
    import Icon from "../../info/icon.svelte"
    import Notification from "../../info/notification.svelte"

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
