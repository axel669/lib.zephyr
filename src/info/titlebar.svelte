<script>
    /*md
    [@] Components/Titlebar

    # Titlebar

    The titlebar is used to set section titles with some style, and provides
    slots for buttons on either side of the title text. Works well as a header
    for Paper components.

    ## Base
    [Windstorm Titlebar](https://axel669.github.io/lib.windstorm/#components-titlebar)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### fill `bool`
        Sets `@fill`

    ## Slots
    - title\\
        The center of the titlebar, where the text usually goes
    - menu\\
        The area on the left of the titlebar (where drawer menus tend to open)
    - action\\
        The area on the right of the titlebar

    ## Usage
    ```svelte
    <Titlebar color="primary" fill>
        <Text title slot="title">
            Some Title
        </Text>

        <Button slot="menu" color={false}>
            <Icon name="menu" />
        </Button>
    </Titlebar>

    <Paper>
        <Titlebar color="secondary" slot="header">
            <Text title slot="title">
                Paper Title
            </Text>
        </Titlebar>
    </Paper>
    ```
    */

    import wsx from "../wsx.mjs"

    export let color
    export let fill = false

    $: wind = {
        "$color": color,
        "$fill": fill,
        ...$$restProps
    }
</script>

<ws-titlebar use:wsx={wind}>
    <slot name="menu" />
    <slot name="title" />
    <slot name="action" />
</ws-titlebar>
