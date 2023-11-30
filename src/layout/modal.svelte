<script>
    /*md
    [@] Components/Modal

    # Modal

    The Modal component is used to control when content should be shown that
    sits over the current content and prevents interaction with the content it
    covers. It is primarily used to show drawers, dialogs, and sub screens.

    The `show` function will display the component specified inside a ws-modal
    element, and can be awaited for an optional return value. The component
    displayed will be passed any props supplied to `show` and a `close` function
    that can be called to hide the component again. `close` can also be given
    an argument that will be used as the promise value from `show`.

    If a component that a modal displays exports a `cancel` function, then
    clicking the modal area outside the displayed component will call that
    `cancel` function, allowing any modal component to decide when/if it is
    closes in response to that event.

    ## Props
    Because the Modal does not render content of its own, it does not support
    any wind functions.

    - ### component `Component`
        The component to display when `show` is called

    ## Functions
    - ### `show(props?) -> Promise`
        Shows the given component and passes any props provided.

    ## Usage
    ```svelte
    <Modal component={CoolDialog} bind:this={dialog} />
    <Button on:click={() => dialog.show({ a: 10, b: 12 })}>
        Open Dialog
    </Button>
    ```
    */
   import { tick } from "svelte"

    export let component

    let modalProps = null
    let resolver = null
    let displayed = null

    const close = (value) => {
        resolver(value)
        resolver = null
        modalProps = null
        visible.checked = false
    }
    const cancel = () => displayed.cancel?.()

    export const show = (props) => new Promise(
        async (resolve) => {
            modalProps = props ?? {}
            resolver = resolve
            await tick()
            setTimeout(
                () => visible.checked = true,
                0
            )
        }
    )

    let visible = null
</script>

<input type="checkbox" bind:this={visible} ws-x="disp[none]" />
{#if resolver !== null}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <ws-modal on:click={cancel} role="dialog">
        <svelte:component
        bind:this={displayed}
        this={component}
        {...modalProps}
        {close}
        />
    </ws-modal>
{/if}
