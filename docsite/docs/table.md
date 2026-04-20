# Table
Wrapper for making tables in a way that is easy to maintain.

## Props

### data _Array_
The data to display in the table.

### fillHeader _bool_
If true, the header row will have the background filled instead of just the
colored border.

### sticky _bool_
If true, the header row will be sticky.

## Snippets

### header(keys)
Used to render the header for the table. Needs to include the `tr`.
> `keys` is the list of keys via `Object.keys` on the first item of the data
> provided (or an empty array if the data has now rows).

### row(item, keys, rowNum)
Used to render an item that is not `undefined`. Needs to include the `tr`.
> `item` is the item for the row.

> `keys` is the same keys as the header snippet gets.

> `rowNum` is the index of the item.
