<script>
    /*md
    [@] Components/Tabs

    # Tabs

    It's tabs, everyone knows what tabs are at this point.

    ## Base
    [Windstorm Tabs](https://axel669.github.io/lib.windstorm/#components-tabs)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### options `Array[Object]`
        An array of options where each item is `{ label, value }`. `label`
        should be a string, `value` can be of any type.
    - ### vertical `bool`
        Sets `$vert`
    - ### solid `bool`
        Sets `$solid`
    - ### value `any`
        The value of the currently selected tab. Can be bound to react to
        changes and set to control which tab is selected.

    ## Usage
    ```js
    const options = [
        { label: "Left", value: "left" },
        { label: "Right", value: 2 },
    ]
    ```
    ```svelte
    <Tab {options} bind:value color="primary" />
    <Tab {options} bind:value color="secondary" solid vertical />
    ```
    */

    import wsx from "./wsx.mjs"
    import { handler$ } from "./handler$.mjs"

    export let color = "primary"
    export let options = []
    export let vertical = false
    export let solid = false
    export let value

    $: index = options.findIndex(item => item.value === value)

    const set = handler$(
        (next) => {
            if (value === next) {
                return
            }
            value = next
        }
    )

    $: wind = {
        "@solid": solid,
        $color: color,
        $vert: vertical,
        ...$$restProps,
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-tabs use:wsx={wind}>
    {#each options as tab, i}
        <ws-tab tab-selected={index === i || null} on:click={set(tab.value)}>
            {tab.label}
        </ws-tab>
    {/each}
</ws-tabs>
