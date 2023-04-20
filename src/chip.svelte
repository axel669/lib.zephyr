<script>
    /*md
    [@] Components/Data Display/Chip

    # Chip
    Shows a small piece of information that is separate from the surrounding
    info and optionally allows interaction.

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### clickable `bool`
        If true, the chip will have the button ripple effect when clicked.
    - ### variant `string`
        Sets the chip type to `@<variant>` (ex: "fill" -> `@fill`). Default
        variant is "outline". Currently supports "fill", "outline".

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

    export let color = "default"
    export let clickable = false
    export let variant = "outline"

    $: wind = {
        [`@${variant}`]: true,
        $color: color,
        $click: clickable,
        ...$$restProps
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-chip use:wsx={wind} on:click>
    <slot />
</ws-chip>
