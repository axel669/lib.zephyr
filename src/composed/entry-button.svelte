<svelte:options immutable />

<script>
    import { createEventDispatcher } from "svelte"

    import Button from "../control/button.svelte"
    import Modal from "../layout/modal.svelte"
    import { handler$ } from "../handler$.mjs"

    export let component
    export let props
    let wrapper = Modal
    export { wrapper as this }

    const send = createEventDispatcher()

    let element = null
    const open = handler$(
        async (props) => {
            const elemProps = (typeof props === "function") ? props() : props
            const result = await element.show(elemProps)
            send("entry", result)
        }
    )
</script>

<Button {...$$restProps} on:click={open(props)}>
    <slot />
</Button>

<svelte:component this={wrapper} {component} bind:this={element} />
