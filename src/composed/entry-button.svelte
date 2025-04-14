<script>
    import Button from "../control/button.svelte"
    import Modal from "../layout/modal.svelte"
    import { handler$ } from "../handler$.js"

    const {
        component,
        props,
        this:Wrapper = Modal,
        "w!props":wrapperProps = {},
        children,
        onentry,
        ...rest
    } = $props()

    let element = null
    const open = handler$(
        async (props) => {
            const elemProps = (typeof props === "function") ? props() : props
            const result = await element.show(elemProps)
            onentry?.(result)
        }
    )
</script>

<Button {...rest} onclick={open(props)} {children} />

<Wrapper bind:this={element} {...rest} {component} />
