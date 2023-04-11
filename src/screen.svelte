<script context="module">
    const ctxStack = Symbol("stack context")
    const ctxClose = Symbol("close context")
</script>

<script>
    import { getContext, setContext } from "svelte"
    import { fly } from "svelte/transition"

    import wsx from "./wsx.mjs"
    import vars from "./vars.mjs"

    export let width = null
    export let component = null

    const stack = getContext(ctxStack) ?? 0
    const animation = {
        y: window.innerHeight,
        duration: 250
    }

    let props = null
    let resolver = null
    const close = (value) => {
        props = null
        resolver(value)
    }
    export const show = (componentProps) => new Promise(
        (resolve) => {
            resolver = resolve
            props = componentProps ?? {}
        }
    )

    setContext(ctxStack, (component === null) ? stack + 1 : stack)

    $: wind = {
        ...$$restProps
    }
    $: settings = {
        stack,
        "screen-width": width,
    }
</script>

{#if component !== null}
    {#if props !== null}
        <svelte:component this={component} {...props} {close} />
    {/if}
{:else}
    <ws-screen use:wsx={wind} use:vars={settings} transition:fly={animation}>
        <slot name="title" />
        <slot name="content" />
        <slot name="footer" />
    </ws-screen>
{/if}
