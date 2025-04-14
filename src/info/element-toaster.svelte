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

    const macros = {
        top: {
            x: "50%",
            tf: "translateX(-50%)",
            "-y": "100%",
            flex: "column-reverse",
        },
        bottom: {
            x: "50%",
            tf: "translateX(-50%)",
            "y": "100%",
            flex: "column"
        },
        left: {
            y: "50%",
            tf: "translateY(-50%)",
            "-x": "100%",
            flex: "row-reverse"
        },
        right: {
            y: "50%",
            tf: "translateY(-50%)",
            "x": "100%",
            flex: "row"
        },
    }
</script>

<script>
    import { fade } from "svelte/transition"

    import { eventHandler$ } from "../handler$.js"
    import wsx from "../wsx.js"

    import ToastMessage from "./toaster/message.svelte"

    const {
        component = ToastMessage,
        position = "top",
        content,
        onaction,
        ...rest
    } = $props()

    let items = $state([])

    const act = eventHandler$(
        (evt, id, props) => {
            delay.trigger(id)
            evt.props = props
            onaction?.(evt)
            // dispatch(
            //     "action",
            //     { value: evt.detail, props }
            // )
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
        gap: "8px",
        pos: "absolute",
        z: "50",
        ...macros[position],
        ...rest,
    })
    const Message = $derived(component)
</script>

<zephyr-element-toaster ws-x="[disp inline-grid] [pos relative]">
    {@render content?.(show)}
    <zephyr-element-toast-messages use:wsx={wind}>
        {#each items as {props, id} (id)}
            <zephyr-toast-wrapper ws-x="[grid]" transition:fade={{duration: 200}}>
                <Message
                {...props}
                onaction={act(id, props)}
                />
            </zephyr-toast-wrapper>
        {/each}
    </zephyr-element-toast-messages>
</zephyr-element-toaster>
