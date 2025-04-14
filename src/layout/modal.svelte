<script module>
    let topClose = null
    export const modalContext = Symbol("modal context")
</script>

<script>
    import { tick, setContext } from "svelte"
    import { writable } from "svelte/store"

    import wsx from "../wsx.js"

    const {
        component,
        animTime = "200ms"
    } = $props()

    let modalProps = $state(null)
    let resolver = $state(null)
    let displayed = $state(null)

    const close = (value) => {
        resolver(value)
        resolver = null
        modalProps = null
        Component = null
        if (topClose !== close) {
            return
        }
        topClose = null
    }
    const closeToTop = (value) => {
        topClose(value)
    }
    const cancel = () => displayed.cancel?.()

    export const show = (props) => new Promise(
        async (resolve) => {
            modalProps = props ?? {}
            topClose = topClose ?? close
            Component = component
            await tick()
            setTimeout(
                () => resolver = resolve,
                0
            )
        }
    )

    const animationTime = writable(animTime)
    const wind = $derived({
        "@anim-time": $animationTime,
        $show: resolver !== null,
    })
    let Component = $state(null)
    setContext(modalContext, animationTime)
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ws-modal onclick={cancel} role="dialog" use:wsx={wind}>
    <Component
    bind:this={displayed}
    this={component}
    {...modalProps}
    {close}
    {closeToTop}
    />
</ws-modal>
