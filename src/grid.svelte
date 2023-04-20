<script>
    /*md
    [@] Components/Containers/Grid

    # Grid

    Container that uses grid layout by default with some nice default values.

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### direction `string`
        Sets `gr-dir`
    - ### pad `string`
        Sets `p`
    - ### gap `string`
        Sets `gap`
    - ### cols `string|Array`
        Sets `gr-col`. Accepts either an array of values that are joined by " "
        or a regular string value.
    - ### rows `string|Array`
        Sets `gr-row`. Accepts either an array of values that are joined by " "
        or a regular string value.
    - ### autoCol `string`
        Sets `gr-acol`
    - ### autoRow `string`
        Sets `gr-arow`

    ## Usage
    ```svelte
    <Grid cross="stretch">
        <Text>Content</Text>
        <Text>More content</Text>
        <Text>Event more content</Text>
    <Grid>
    ```
    */
    import wsx from "./wsx.mjs"

    export let direction = false
    export let pad = false
    export let gap = false
    export let cols = null
    export let rows = null
    export let autoCol = false
    export let autoRow = false

    $: wind = {
        "gr-dir": direction,
        "gr-col": cols?.join?.(" ") ?? cols ?? false,
        "gr-row": rows?.join?.(" ") ?? rows ?? false,
        "gr-acol": autoCol,
        "gr-arow": autoRow,
        p: pad,
        gap: gap,
        ...$$restProps
    }
</script>

<ws-grid use:wsx={wind}>
    <slot />
</ws-grid>
