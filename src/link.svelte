<script>
    /*md
    [@] Components/Link

    # Link

    Themed and customizale <a> tag component.

    ## Base
    [Windstorm Link](https://axel669.github.io/lib.windstorm/#components-link)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### button `string`
        If true, the link will be styled like a button
    - ### color `string`
        Sets the color of the button. Applies to both regular links and button
        style links.
    - ### href `string`
        Sets the href attribute.
    - ### rel `string`
        Sets the rel attribute.
    - ### target `string`
        Sets the target attribute
    - ### variant `string`
        Sets the link-button type to `@<variant>` (ex: "flat" -> `@flat`).
        Default variant is "flat". Currently supports "flat", "fill", "outline".

    ## Usage
    ```svelte
    <Link color="primary" href="test" target="_blank">
        Test
    </Link>
    <Link color="primary" href="logout" button variant="outline">
        Logout
    </Link>
    ```
    */

    import wsx from "./wsx.mjs"

    export let button = false
    export let variant = "flat"
    export let color = "default"

    export let href = ""
    export let rel = "noreferrer"
    export let target = null

    $: wind = {
        "@button": button,
        [`@${variant}`]: true,
        $color: color,
        ...$$restProps
    }
</script>

<a {href} {target} {rel} use:wsx={wind}>
    <slot />
</a>
