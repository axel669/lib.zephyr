<script>
    import { Confirm, Button, EntryButton, Modal } from "@axel669/zephyr"

    let confirmModal = $state(null)
    const show = async () => {
        const result = await confirmModal.show()
        if (result === true) {
            console.log("confirmed!")
            return
        }
        console.log("cancelled :(")
    }
</script>

<Modal bind:this={confirmModal}>
    <Confirm title="Confirm Example" message="This is a confirm!" />
</Modal>
<Button onclick={show} color="@primary" outline>
    Show Confirm
</Button>

<EntryButton color="@secondary" outline m!cancelable>
    Show Confirm
    {#snippet modal()}
        <Confirm title="Confirm Example" message="This is a confirm!" />
    {/snippet}
</EntryButton>
