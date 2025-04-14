# Table
Wrapper for making tables in a way that is easy to maintain.

## Props

### cols _string_
Sets the columns to use in the table, uses the grid template columns syntax.

### color _string_
Sets the $color macro.

### data _Array_
The data to display in the table.

### fillHeader _bool_
If true, the header row will have the background filled instead of just the
colored border.

### stickyHeader _bool_
If true, the header row will be sticky.

## Snippets

### empty-row(rowNum)
If given, will render when the item in the array is `undefined`.

### header()
Used to render the header for the table. Needs to include the `tr`.

### row(rowData, rowNum)
Used to render an item that is not `undefined`. Needs to include the `tr`.
