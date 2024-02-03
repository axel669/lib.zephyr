# Confirm Dialog
A nicer confirm dialog to use with [Modal](../layout/dialog.md).

## Props

### color
Sets the $color macro.

### icon
The name of an icon to show with the title of the dialog.

### message
The message to shwo in the confirm.

### cancelText
The text for the button that cancels the dialog.

### okText
The text for the button that confirms the dialog.

### title
The title for the dialog.

## Return Values
The Confirm component will return `true` from the `Modal.show` function if the
OK button is clicked, and false if the Cancel button is clicked.

## Example
```svelte
<script>
    import { Confirm, Button, EntryButton, Modal } from "@axel669/zephyr"

    let confirmModal = null
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
<Button on:click={show}>
    Show Confirm
</Button>

<EntryButton props={confirmProps}>
    Show Confirm
</EntryButton>
```
