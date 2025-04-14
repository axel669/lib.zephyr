<script>
    import { Alert, Button, EntryButton, Modal } from "@axel669/zephyr"

    let alertModal = $state(null)
    const show = () => alertModal.show({
        titleText: "Alert Example",
        message: "This is an alert!"
    })

    const propsFromButton = {
        titleText: "Alert Example",
        message: "This is an alert!",
        color: "@secondary",
    }
</script>

<Modal component={Alert} bind:this={alertModal} />
<Button onclick={show} outline color="@primary">
    Using a Modal
</Button>

<EntryButton component={Alert} props={propsFromButton} outline color="@secondary">
    Using EntryButton
</EntryButton>
