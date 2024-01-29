# DataTable

The DataTable is a more advanced way to show data on screen. Underneath is
a [Table](../data-display/table.md) component, but with additional functionality
for pagination, sorting, and fitering.

> If pagination is not needed, the DataTable may not be necessary as it will
> only be shortcutting data formatting at that point.

## Props

### color
Sets `$color`

### data
`Array`

The data to display. Each item in the array can be in either the same
format as the Table, or any kind of object if column format functions
are used.

### page
`Number`

The current page of data being viewed. Can be bound, or set to control
which page is displayed

### pageSize
`Number`

The number of items to show on each page. Default is 10.

### rowHeight
The height of each row. The component uses this to make empty rows the same
height as rows with data so that the pagination doesnt randomly resize the
visual area of the table.

## Slots

### header
A fragment that should contain the header cells for the table header. A standard
`th` can be used, but the [TH](./data-table/th.md) element from zephyr has
additional configuration to handle more complex header-related actions.

### row
A fragment that should use regular `td` elements to define how a row should be
layed out. The fragment will need `let:row` to access each row's data for
displaying it.

## Example
```svelte
<script>
    import { DataTable, TH, sorts } from "@axel669/zephyr"

    let page
    const data = [
        { a: 1, b: 1 ** 2, c: 1 ** 3 },
        { a: 2, b: 2 ** 2, c: 2 ** 3 },
        { a: 3, b: 3 ** 2, c: 3 ** 3 },
        { a: 4, b: 4 ** 2, c: 4 ** 3 },
        { a: 5, b: 5 ** 2, c: 5 ** 3 },
        { a: 6, b: 6 ** 2, c: 6 ** 3 },
        { a: 7, b: 7 ** 2, c: 7 ** 3 },
        { a: 8, b: 8 ** 2, c: 8 ** 3 },
        { a: 9, b: 9 ** 2, c: 9 ** 3 },
        { a: 10, b: 10 ** 2, c: 10 ** 3 },
        { a: 11, b: 11 ** 2, c: 11 ** 3 },
        { a: 12, b: 12 ** 2, c: 12 ** 3 },
        { a: 13, b: 13 ** 2, c: 13 ** 3 },
    ]
</script>

<DataTable {cols} {data} color="warning" pageSize={3} bind:page>
    <svelte:fragment slot="header">
        <TH sort={sorts.natural}>N</TH>
        <th>Squared</th>
        <th>Cubed</th>
    </svelte:fragment>

    <svelte:fragment slot="row" let:row>
        <td>{row.a}</td>
        <td>{row.b}</td>
        <td>^3 = {row.c}</td>
    </svelte:fragment>
</DataTable>
```
