<script>
    import { Alert, Button, EntryButton, Modal } from "@axel669/zephyr"

    let alertModal = $state(null)
    const show = () => alertModal.show()
</script>

<Modal bind:this={alertModal}>
    <Alert title="Alert Example" message="This is an alert!" />
</Modal>
<Button onclick={show} outline color="@primary">
    Using a Modal
</Button>

<EntryButton outline color="@secondary" m!cancelable>
    Using EntryButton
    {#snippet modal()}
        <Alert title="Alert Example" message="This is an alert!" color="@secondary" />
    {/snippet}
</EntryButton>
