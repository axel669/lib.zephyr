<script module>
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
    import { fade } from "svelte/transition"

    import { eventHandler$ } from "../handler$.js"
    import wsx from "../wsx.js"

    import ToastMessage from "./toaster/message.svelte"

    const {
        message = ToastMessage,
        position = "tc",
        onaction,
        ...rest
    } = $props()

    let items = $state([])

    const act = eventHandler$(
        (evt, id, props) => {
            delay.trigger(id)
            evt.props = props
            onaction?.(evt)
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

    const wind = $derived({
        [`$${position}`]: true,
        ...rest,
    })
    const Message = $derived(message)
</script>

<ws-toaster use:wsx={wind}>
    {#each items as {props, id} (id)}
        <zephyr-toast-wrapper ws-x="[grid]" transition:fade={{duration: 200}}>
            <Message
            {...props}
            onaction={act(id, {...props})}
            />
        </zephyr-toast-wrapper>
    {/each}
</ws-toaster>
