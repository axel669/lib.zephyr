<script>
    /*md
    [@] Components/Data Display/Chip

    # Chip
    Shows a small piece of information that is separate from the surrounding
    info and optionally allows interaction.

    ## Base
    [Windstorm Chip](https://axel669.github.io/lib.windstorm/#components-chip)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### clickable `bool`
        If true, the chip will have the button ripple effect when clicked.
    - ### fill `bool`
        If true, sets @fill on the chip. If false @outline is set instead.

    ## Events
    - click

    ## Example
    ```svelte
    Emails:
    <Chip clickable>admin@site.com</Chip>
    <Chip clickable color="warning">weirdge@site.com</Chip>
    <Chip color="primary">required@site.io</Chip>
    ```
    */

    import wsx from "./wsx.mjs"
    import variant from "./variant.mjs"

    export let color = "default"
    export let clickable = false

    export let fill = false

    $: type = variant({ fill }, "@outline")

    $: wind = {
        [type]: true,
        $color: color,
        $click: clickable,
        ...$$restProps
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-chip use:wsx={wind} on:click>
    <slot />
</ws-chip>
