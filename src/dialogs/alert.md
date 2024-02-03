# Alert Dialog
A nicer alert dialog to use with [Modal](../layout/dialog.md).

## Props

### color
Sets the $color macro.

### icon
The name of an icon to show with the title of the alert.

### message
The message to shwo in the alert.

### okText
The text for the button that closes the alert.

### title
The title for the alert.

## Example
```svelte
<script>
    import { Alert, Button, EntryButton, Modal } from "@axel669/zephyr"

    let alertModal = null
    const alertProps = {
        title: "Alert Example",
        message: "This is an alert!"
    }
    const show = () => alertModal.show(alertProps)
</script>

<Modal component={Alert} bind:this={alertModal} />
<Button on:click={show}>
    Show Alert
</Button>

<EntryButton props={alertProps}>
    Show Alert
</EntryButton>
```
