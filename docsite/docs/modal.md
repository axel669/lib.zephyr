# Modal
The Modal component is used to control when content should be shown that
sits over the current content and prevents interaction with the content it
covers. It is primarily used to show drawers, dialogs, and sub screens.

Showing the modal is done through binding to it as a component and using the
show function documented below.

Beacuse the modal does not pass its information to its children through props,
the `modalContext` and `modalAnimTime` functions from the library are used to
get the close functions and animation time.

## Props
Because the Modal does not render content of its own, it does not support
any wind functions.

### cancelable _bool_
If true, clicking outside the child component will close the modal.

## Functions

### `show() -> Promise`
Shows the child component and returns the result of the user interaction.
The Alert, Confirm, and Prompt from Zephyr all return `true` when the ok button
is clicked, `false` when the cancel button is clicked (if there is one), and
`null` when the modal is canceled.

## Modal Contexts

```svelte
<script>
    import { modalContext } from "@axel669/zephyr"

    const { close, closeToTop } = modalContext()
</script>

<ModalElement />
```
