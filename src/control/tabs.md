# Tabs

It's tabs, everyone knows what tabs are at this point.

## Props

### color
`string`

Sets `$color`

### options
`Array[Object]`

An array of options where each item is `{ label, value }`. `label`
should be a string, `value` can be of any type.

### vertical
`bool`

Sets `$vert`

### solid
`bool`

Sets `$solid`

### value
`any`

The value of the currently selected tab. Can be bound to react to
changes and set to control which tab is selected.

## Example
```svelte
<script>
    import { Tabs } from "@axel669/zephyr"

    const options = [
        { label: "Left", value: "left" },
        { label: "Right", value: 2 },
    ]
</script>

<Tab {options} bind:value color="primary" />
<Tab {options} bind:value color="secondary" solid vertical />
```
