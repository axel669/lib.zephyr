<script>
    import Button from "../control/button.svelte"
    import Modal from "../layout/modal.svelte"
    import { handler$ } from "../handler$.js"
    import { splitProps } from "../props.js"

    const {
        children,
        modal,
        onentry,
        onopen,
        ...rest
    } = $props()

    const prop = splitProps(rest, "m!")

    let element = null
    const open = async (props) => {
        onopen?.()
        const result = await element.show()
        onentry?.(result)
    }
</script>

<Button {...prop.rest} onclick={open} {children} />

<Modal bind:this={element} {...prop["m!"]}>
    {@render modal()}
</Modal>
