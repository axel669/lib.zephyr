# Grid

Container that uses grid layout by default with some nice default values.

## Base
[Windstorm Grid](https://axel669.github.io/lib.windstorm/#components-grid)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.


### direction
`string`

Sets `gr.flow`

### pad
`string`

Sets `p`

### gap
`string`

Sets `gap`

### cols
`string|Array`

Sets `gr.cols`. Accepts either an array of values that are joined by " "
or a regular string value.

### rows
`string|Array`

Sets `gr.rows`. Accepts either an array of values that are joined by " "
or a regular string value.

### autoCol
`string`

Sets `gr.cols.a`

### autoRow
`string`

Sets `gr.rows.a`

## Example
```svelte
<script>
    import { Grid, Text } from "@axel669/zephyr"
</script>

<Grid cols="1fr 1fr">
    <Text>Content</Text>
    <Text>More content</Text>
    <Text>Event more content</Text>
<Grid>
```
