<script>
    /*md
    [@] Components/EntryButton

    # EntryButton

    The EntryButton is a convenient way to display modals and screens over
    content without needing to bind variables have lots of Modal elements in
    addition to the buttons that show them.

    ## Props

    - ### component
        The component to show when clicked
    - ### props
        The props to pass to the component when it is shown, or a function that
        generates the props when called
    - ### this
        The wrapper for the component. Default is Modal but any component that
        has the same interface as Modal will work

    ## Events
    - ### entry
        When the component is close the entry event is fired. The detail
        property of the event will have the value from closing it

    ## Usage
    ```svelte
    <EntryButton component={Subscreen} on:entry={console.log}>
        Open Subscreen
    </EntryButton>
    <EntryButton component={CoolDialog} on:entry={console.log}>
        Open Subscreen
    </EntryButton>
    <EntryButton this={CoolModal} component={CustomThing} on:entry={console.log}>
        Open Subscreen
    </EntryButton>
    ```
    */

    import { createEventDispatcher } from "svelte"

    import Button from "../button.svelte"
    import Modal from "../modal.svelte"
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
