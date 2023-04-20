<script>
    /*md
    [@] Components/Containers/Flex

    # Flex

    Container that uses flex layout by default with some nice default values.

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
        Sets `fl-cr-a`
    - ### main `string`
        Sets `fl-m-a`

    ## Usage
    ```svelte
    <Flex cross="stretch">
        <Text>Content</Text>
        <Text>More content</Text>
        <Text>Event more content</Text>
    <Flex>
    ```
    */

    import wsx from "./wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cross = "start"
    export let main = "start"

    $: wind = {
        "fl-dir": direction,
        "fl-cr-a": cross,
        "fl-m-a": main,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-flex use:wsx={wind}>
    <slot />
</ws-flex>
