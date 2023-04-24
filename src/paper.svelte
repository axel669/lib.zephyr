<script>
    /*md
    [@] Components/Containers/Paper

    # Paper

    The Paper component is a container that has slots for header and footer
    content that is independant from the regular content scrolling. It also uses
    Flex as a default layout for its slotted content, but allows any container
    to be used as a layout without increasing the indentation of all the content
    needlessly.

    ## Base
    [Windstorm Paper](https://axel669.github.io/lib.windstorm/#components-paper)

    ## Base
    [Windstorm Paper](https://axel669.github.io/lib.windstorm/#components-paper)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### card `bool`
        Sets `@outline`
    - ### square `bool`
        Sets `r[0px]`
    - ### layout `Component`
        Sets the layout the card will use to display content. Default is Flex.
    - ### scrollable `bool`
        Sets `over[auto]` on the layout component
    - ### lprops `Object`
        An object with props to pass to the layout component
    */

    import Flex from "./flex.svelte"
    import wsx from "./wsx.mjs"

    export let color
    export let card = false
    export let square = false
    export let layout = Flex
    export let scrollable = false
    export let lprops = {}

    $: props = {
        over: scrollable ? "auto" : false,
        ...lprops,
    }
    $: wind = {
        $color: color,
        "@outline": card,
        r: square && "0px",
        ...$$restProps
    }
</script>

<ws-paper use:wsx={wind}>
    <slot name="header" />
    <svelte:component this={layout} {...props} slot="content">
        <slot />
    </svelte:component>
    <slot name="footer" />
</ws-paper>
