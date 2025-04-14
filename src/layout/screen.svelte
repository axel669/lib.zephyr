<script module>
    const ctxStack = Symbol("stack context")
    const ctxClose = Symbol("close context")
</script>

<script>
    import { getContext, setContext } from "svelte"
    import { fly } from "svelte/transition"

    import wsx from "../wsx.js"

    const {
        alignLeft = false,
        width = false,
        children,
        ...rest
    } = $props()

    const stack = getContext(ctxStack) ?? 0
    const animation = {
        y: window.innerHeight,
        duration: 350
    }

    setContext(ctxStack, stack + 1)

    const wind = $derived({
        "@stack": stack.toString(),
        "@screen-width": width,
        "bg.c": "transparent",
        $left: alignLeft,
        ...rest
    })
</script>

<ws-screen use:wsx={wind} transition:fly={animation}>
    {@render children?.()}
</ws-screen>
