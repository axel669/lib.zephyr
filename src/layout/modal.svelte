<script module>
    import { getContext } from "svelte"

    let topClose = null
    const modalAnimTimeSymbol = Symbol("modal animation time")
    const modalContextSymbol = Symbol("modal context")

    export const modalAnimTime = () => getContext(modalAnimTimeSymbol)
    export const modalContext = () => getContext(modalContextSymbol)
</script>

<script>
    import { setContext } from "svelte"
    import { writable } from "svelte/store"

    import wsx from "../wsx.js"
    import { frameDelay } from "../internals.js"

    const {
        children,
        cancelable = false,
        animTime = "200ms"
    } = $props()

    let resolver = $state(null)
    let shown = $state(false)

    const close = (value) => {
        resolver(value)
        resolver = null
        shown = false
        if (topClose !== close) {
            return
        }
        topClose = null
    }
    const closeToTop = (value) => {
        topClose(value)
    }
    const cancel = () => {
        if (cancelable === false) {
            return
        }
        close(null)
    }

    export const show = (props) => new Promise(
        (resolve) => {
            topClose = topClose ?? close
            resolver = resolve
            frameDelay(1, () => shown = true)
        }
    )

    const animationTime = writable(animTime)
    const wind = $derived({
        "@anim-time": $animationTime,
        $show: shown === true,
    })
    setContext(modalAnimTimeSymbol, animationTime)
    setContext(modalContextSymbol, { close, closeToTop })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<ws-modal onclick={cancel} role="dialog" use:wsx={wind}>
    {#if resolver !== null}
        {@render children()}
    {/if}
</ws-modal>
