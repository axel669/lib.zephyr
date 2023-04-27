<script context="module">
    const groupOptions = (options) => options.reduce(
        ({grouped, target = grouped}, item, pos) => {
            const opt = { ... item, pos }
            if (item.group === undefined) {
                target.push(opt)
                return { grouped, target }
            }
            const next = [opt]
            grouped.push(next)
            return { grouped, target: next }
        },
        { grouped: [] }
    ).grouped
</script>

<script>
    /*md
    [@] Components/Input/Select

    # Select

    A wrapper for select elements to make them look nicer.

    ## Base
    [Windstorm Labeled Control](https://axel669.github.io/lib.windstorm/#components-labeled control)
    using a `<select>`

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### label `string`
        The text to display as the label
    - ### options `Array[Object]`
        An array of options and groups to show in the select. Details below
    - ### outline `bool`
        Sets `@outline`
    - ### value `any`
        The value currently selected. Can be bound to react to selections or
        change the current selection.

    ## Options
    Each object in the options provided should be in one of 2 forms:
    - `{ label, value }`
    - `{ group }`

    Items with a label and value are displayed as <option> tags in the select.
    Items with a group defined are used to denote <optgroup> tags. Each option
    after a `{ group }` item until another group item is seen (or the end of the
    array) is put into the optgroup defined by the group item.

    Labels and group names should be strings, but values can be any type.

    ## Usage
    ```js
    // Results in:
    // <option>first</option>
    // <optgroup label="Not Numbers">
    //     <option>second</option>
    //     <option>third</option>
    // </optgroup>
    const options = [
        { label: "first", value: 1 },
        { group: "Not numbers" },
        { label: "second", value: "two" },
        { label: "third", value: [3] },
    ]
    ```
    ```svelte
    <Select {options} bind:value label="Blep" />
    <Select {options} bind:value color="warning" label="Why" />
    ```
    */

    import wsx from "./wsx.mjs"

    export let options = []
    export let value
    export let color = "default"
    export let outline = false
    export let label = null
    export let disabled = false

    const update = (evt) => value = options[evt.target.value].value

    $: indexValue = options.findIndex(item => item.value === value)

    $: grouped = groupOptions(options)

    $: wind = {
        "@control": true,
        "@outline": outline,
        $color: color,
        ...$$restProps,
    }
</script>

<label use:wsx={wind}>
    {#if label}
        <span ws-x="$text">{label}</span>
    {/if}
    <select value={indexValue} on:input={update} {disabled}>
        {#each grouped as item, index}
            {#if Array.isArray(item) === false}
                <option value={item.pos}>
                    {item.label}
                </option>
            {:else}
                <optgroup label={item[0].group}>
                    {#each item.slice(1) as subitem, subindex}
                        <option value={subitem.pos}>
                            {subitem.label}
                        </option>
                    {/each}
                </optgroup>
            {/if}
        {/each}
    </select>
</label>
