<script>
    /*md
    [@] Components/Input/Toggle

    # Toggle

    The Toggle component is used to display checkboxes and switches.

    ## Base
    [Windstorm Labeled Toggle](https://axel669.github.io/lib.windstorm/#components-labeled-toggle)
    using a checkbox input

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### checkbox `bool`
        If true, the toggle is displayed as a checkbox. Default is false
        (shown as a switch)
    - ### checked `bool`
        Controls if the toggle is checked or not. Can be bound
    - ### group
        Used for binding, see the Svelte bind:group for details
    - ### label `string`
        The text to use for the label
    - ### flat `bool`
        Sets `@flat`
    - ### reverse `bool`
        If true, the input being toggled will be on the left instead of the
        right. Default is false (label is on the left)
    - ### value
        Only used in conjunction with bind:group, see Svelte docs

    ## Usage
    ```svelte
    <Toggle label="Active" bind:checked />
    <Toggle label="Active" checkbox bind:checked />
    <Toggle label="Active" checkbox reverse bind:checked />
    <Toggle label="Active" checkbox flat color="danger" bind:checked />
    ```
    */

    import wsx from "../wsx.mjs"

    export let label = ""
    export let color = "default"
    export let checked = false
    export let flat = false
    export let value
    export let group = []
    export let checkbox = false
    export let reverse = false

    $: container = {
        "$toggle": true,
        "$flat": flat,
        "$color": color,
        ...$$restProps,
    }
    $: input = {
        "$switch": checkbox === false
    }

    const updateGroup = (checked) => {
        if (checked === true) {
            if (group.includes(value) === true) {
                return
            }
            group = [...group, value]
            return
        }
        if (group.includes(value) === false) {
            return
        }
        group = group.filter(item => item !== value)
    }
    $: updateGroup(checked)
</script>

<label use:wsx={container}>
    {#if reverse !== true}
        {#if $$slots.default}
            <slot />
        {:else}
            <span>{label}</span>
        {/if}
    {/if}
    <input type="checkbox" bind:checked use:wsx={input} />
    {#if reverse === true}
        <span>{label}</span>
    {/if}
</label>
