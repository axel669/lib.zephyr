<script>
    /*md
    [@] Components/Icon

    # Icon

    Displays a [Tabler Icon](https://tabler-icons.io/) and some optional text.
    The icon will appear at the beginning of the text.

    ## Base
    [Windstorm Icon](https://axel669.github.io/lib.windstorm/#components-icon)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### name `string`
        The name of the icon. Use the tabler icon class name without the "ti-".

    ## Usage
    ```svelte
    <Icon name="hexagon" />
    <Icon name="hexagons">Are the bestagons</Icon>
    ```
    */

    import wsx from "../wsx.mjs"

    export let name
</script>

<ws-icon class="ti-{name}" use:wsx={$$restProps}>
    <slot />
</ws-icon>
