<svelte:options immutable />

<script context="module">
    const ctxStack = Symbol("stack context")
    const ctxClose = Symbol("close context")
</script>

<script>
    import { getContext, setContext } from "svelte"
    import { fly } from "svelte/transition"

    import wsx from "../wsx.mjs"

    export let width = false

    const stack = getContext(ctxStack) ?? 0
    const animation = {
        y: window.innerHeight,
        duration: 350
    }

    setContext(ctxStack, stack + 1)

    $: wind = {
        "@stack": stack.toString(),
        "@screen-width": width,
        "bg.c": "transparent",
        ...$$restProps
    }
</script>

<ws-screen use:wsx={wind} transition:fly={animation}>
    <slot />
</ws-screen>
