# Table
Wrapper for making tables in a way that is easy to maintain.

## Props

### color
`string`

Sets the $color macro.

### data
`Array`

The data to display in the table.

### fillHeader
`bool`

If true, the header row will have the background filled instead of just the
colored border.

## Slots

### header
Used to render the header for the table. Needs to include the `tr`.

### row
Used to render an item that is not `undefined`. Needs to include the `tr`. Uses
`let:row` for the row data, and `let:rowNum` for the row number (0-based).

### empty-row
If given, will render when the item in the array is `undefined`. Uses
`let:rowNum` for the row number (0-based).

## Example
```svelte
<script>
    import { Table } from "@axel669/zephyr"

    const data = Array.from(
        { length: 20 },
        (_, i) => [i, i ** 2, i ** 3]
    )
</script>

<Table>
    <tr slot="header">
        <th>N</th>
        <th>Squared</th>
        <th>Cubed</th>
    </tr>

    <tr slot="row" let:row>
        <td>{row[0]}</td>
        <td>{row[1]}</td>
        <td>{row[2]}</td>
    </tr>
</Table>
```
