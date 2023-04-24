<script context="module">
    const ctxStack = Symbol("stack context")
    const ctxClose = Symbol("close context")
</script>

<script>
    /*md
    [@] Components/Containers/Screen

    # Screen

    The screen is a container component that is used for displaying content
    over its parent and stacks as more screens are displayed. Screens that stack
    on top of a parent screen use the Modal to control when they are shown and
    pass values back from child screens. The stacking effect of the Screen is
    controlled by internally tracked svelte context, so no manual effort is
    required to get stacking screens to have the effect.

    ## Base
    [Windstorm Screen](https://axel669.github.io/lib.windstorm/#components-screen)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported, but they probably won't help much with this component.

    - ### width `string`
        The width of the screen before stack-based padding is applied

    ## Usage
    `cool-screen.svelte`
    ```svelte
    <Screen width="70%">
        <Paper>
            This screen is pretty cool I swear
            <Button on:click={() => close("hi")}>
                Close
            </Button>
        </Paper>
    </Screen>
    ```
    */

    import { getContext, setContext } from "svelte"
    import { fly } from "svelte/transition"

    import wsx from "./wsx.mjs"
    import vars from "./vars.mjs"

    export let width = false

    const stack = getContext(ctxStack) ?? 0
    const animation = {
        y: window.innerHeight,
        duration: 350
    }

    setContext(ctxStack, stack + 1)

    $: wind = {
        "&stack": stack.toString(),
        "&screen-width": width,
        "bg-c": "transparent",
        ...$$restProps
    }
</script>

<ws-screen use:wsx={wind} transition:fly={animation}>
    <slot />
</ws-screen>
