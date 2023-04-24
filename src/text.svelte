<script>
    /*md
    [@] Components/Text

    # Text

    Simple component with some common props for types of text.

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### adorn `bool`
        Sets `$adorn`
    - ### block `bool`
        Sets `block`
    - ### subtitle `bool`
        Sets `$subtitle`
    - ### title `bool`
        Sets `$title`

    ## Usage
    ```svelte
    <Text>Some text</Text>
    <Text title>Bigger text</Text>
    <Text subtitle>Smaller text</Text>
    <Text block>Text on its own line</Text>
    ```
    */

    import wsx from "./wsx.mjs"

    export let title = false
    export let subtitle = false
    export let block = false
    export let adorn = false

    $: wind = {
        "$title": title,
        "$subtitle": subtitle,
        "$adorn": adorn,
        block,
        ...$$restProps
    }
</script>

<span use:wsx={wind}>
    <slot />
</span>
