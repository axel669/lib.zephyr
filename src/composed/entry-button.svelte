<script>
    import { createEventDispatcher } from "svelte"

    import Button from "../button.svelte"
    import { handler$ } from "../handler$.mjs"

    export let component
    export let props
    let wrapper = null
    export { wrapper as this }

    const send = createEventDispatcher()

    let element = null
    const open = handler$(
        async (props) => {
            const result = await element.show(props)
            send("entry", result)
        }
    )
</script>

<Button {...$$restProps} on:click={open(props)}>
    <slot />
</Button>

<svelte:component this={wrapper} {component} bind:this={element} />
