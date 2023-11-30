<script>
    /*md
    [@] Components/Containers/Flex

    # Flex

    Container that uses flex layout by default with some nice default values.

    ## Base
    [Windstorm Flex](https://axel669.github.io/lib.windstorm/#components-flex)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### direction `string`
        Sets `fl-dir`
    - ### pad `string`
        Sets `p`
    - ### gap `string`
        Sets `gap`
    - ### cross `string`
        Sets `fl-cr-a`, default is `"stretch"`
    - ### main `string`
        Sets `fl-m-a`, default is `"start"`

    ## Usage
    ```svelte
    <Flex cross="stretch">
        <Text>Content</Text>
        <Text>More content</Text>
        <Text>Event more content</Text>
    <Flex>
    ```
    */

    import wsx from "../wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cross = "stretch"
    export let main = "start"

    $: wind = {
        "fl.dir": direction,
        "fl.cross": cross,
        "fl.main": main,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-flex use:wsx={wind}>
    <slot />
</ws-flex>
