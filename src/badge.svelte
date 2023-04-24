<script>
    /*md
    [@] Components/Data Display/Badge

    # Badge
    Adds a small badge over the upper-right corner of some content.

    ## Base
    [Windstorm Badge](https://axel669.github.io/lib.windstorm/#components-badge)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### text `string`
        The badge text.

    ## Example
    ```svelte
    <Badge text="100">
        Unread Messages
    </Badge>
    <Badge text="1k+" color="warning">
        <button>Clickable Content</button>
    </Badge>
    ```
    */
    import wsx from "./wsx.mjs"

    export let color = "default"
    export let text = ""

    $: wind = { $color: color, ...$$restProps }
</script>

<ws-badge ws-text={text} use:wsx={wind}>
    <slot />
</ws-badge>
