<script>
    import { Alert, Button, Modal } from "@axel669/zephyr"

    let alertModal = $state(null)
    const show = () => alertModal.show({
        titleText: "Alert Example",
        message: "This is an alert!"
    })
</script>

<Modal component={Alert} bind:this={alertModal} />
<Button onclick={show} outline color="@primary">
    Alert Modal
</Button>
