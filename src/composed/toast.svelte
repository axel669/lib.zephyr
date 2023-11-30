<script context="module">
    const genID = () => `${Date.now()}:${Math.random().toString(16)}`

    const delays = {}
    const delay = ({time, action, id}) => {
        const trigger = () => {
            const info = delays[id]
            clearTimeout(info.id)
            action()
            delete delays[id]
        }
        const timeoutID = setTimeout(trigger, time)
        delays[id] = { trigger, id: timeoutID }
    }
    delay.trigger = (id) => delays[id].trigger()
</script>

<script>
    /*md
    [@] Components/Toast

    # Toast

    Displays toast notifications along the edge of the screen.

    ## Props
    See the Toaster component. The Toast component is wrapper around it that
    also controls the children being shown for convenience.

    - ### component
        The component to use as a wrapper for the messages. Defaults to the
        ToastMessage component.

    ## Functions
    - ### show(duration, props)
        Shows a toast notification that will disappear after the specified
        duration (time in milliseconds). The props provided are passed to an
        instance of the component specified in the props.

    ## Events
    - ### action(info)
        Fired when a toast message is clicked. The info argument contains a
        value property that is provided by the message component, and a copy
        of the props passed to that instace.\\
        For the default messages, the value will be `null` if no button was
        clicked, and `true` if the action button was clicked. This allows
        actions to be taken against interactions in the message without having
        to bind all kinds of events or callbacks.

    ## Usage
    ```js
    let toast = null
    const notify = () => toast.show(5000, { message: "hi" })
    ```
    ```svelte
    <Toast bind:this={toast} position="bc" />
    ```
    */
    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"

    import { eventHandler$ } from "../handler$.mjs"

    import Toaster from "../info/toaster.svelte"

    import ToastMessage from "./toast/message.svelte"

    export let component = ToastMessage
    export let position = "tc"

    let items = []

    const dispatch = createEventDispatcher()
    const act = eventHandler$(
        (evt, id, props) => {
            delay.trigger(id)
            dispatch(
                "action",
                { value: evt.detail, props }
            )
        }
    )

    export const show = (duration, props) => {
        const id = genID()
        items = [...items, { id, props }]
        delay({
            action: () => items = items.filter(
                item => item.id !== id
            ),
            time: duration,
            id,
        })
    }
    export const clear = () => items = []
</script>

<Toaster {position} {...$$restProps}>
    {#each items as {props, id} (id)}
        <wsv-toast-wrapper ws-x="grid" transition:fade={{duration: 200}}>
            <svelte:component
            this={component}
            {...props}
            on:action={act(id, props)}
            />
        </wsv-toast-wrapper>
    {/each}
</Toaster>
