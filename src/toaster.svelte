<script>
    /*md
    [@] Components/Containers/Toaster

    # Toaster

    The Toaster component is used for building popup notifications along the
    edges of the window.

    ## Base
    [Windstorm Toaster](https://axel669.github.io/lib.windstorm/#components-toaster)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported, but probably not very meaningful for this container.

    - ### position
        Sets position of the toaster. See the windstorm base for values.

    ## Usage
    <Toaster position="$tc">
        <Notification>
            <Icon name="info">
                Some kind of notification of things
            </Icon>
        </Notification>
    </Toaster>
    */

    import wsx from "./wsx.mjs"

    export let position = "tc"

    $: wind = {
        [`$${position}`]: true,
        ...$$restProps,
    }
</script>

<ws-toaster use:wsx={wind}>
    <slot />
</ws-toaster>
