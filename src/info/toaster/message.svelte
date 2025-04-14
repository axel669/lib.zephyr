<script>
    import Button from "../../control/button.svelte"
    import Icon from "../icon.svelte"
    import Toast from "../toast.svelte"
    import Text from "../../text.svelte"

    const {
        message = "",
        icon = false,
        color = false,
        actionText = null,
        onaction,
    } = $props()

    const dismiss = () => onaction({ value: null })
    const respond = (evt) => {
        evt.stopPropagation()
        onaction({ value: true })
    }
</script>

<Toast {color} onclick={dismiss}>
    {#snippet start()}
    <Text adorn>
        {#if icon !== false}
            <Icon name={icon} />
        {/if}
    </Text>
    {/snippet}

    <span>{message}</span>

    {#snippet end()}
    <div ws-x="[grid]">
        {#if actionText}
            <Button onclick={respond} r.l="0px" ground>
                {actionText}
            </Button>
        {/if}
    </div>
    {/snippet}
</Toast>
