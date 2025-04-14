<script>
    import { Confirm, Button, EntryButton, Modal } from "@axel669/zephyr"

    let confirmModal = $state(null)
    const confirmProps = {
        title: "Confirm Example",
        message: "This is an confirm!"
    }
    const show = async () => {
        const result = await confirmModal.show(confirmProps)
        if (result === true) {
            console.log("confirmed!")
            return
        }
        console.log("cancelled :(")
    }
</script>

<Modal component={Confirm} bind:this={confirmModal} />
<Button onclick={show} color="@primary" outline>
    Show Confirm
</Button>

<EntryButton props={confirmProps} component={Confirm} color="@secondary" outline>
    Show Confirm
</EntryButton>
