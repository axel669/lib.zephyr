# DataTable
The DataTable is a more advanced way to show data on screen. It uses a windstorm
table under the hood, and has a similar interface to the [Table](#/table).
Instead of trying to make pagination and deal with weird heights of things, the
DataTable opts to provide a virtual scrolling area to render content in an
efficient way.

> This version doesn't have sorting and filtering, but those are being planned
> for a future release. Attempting to make the interfacing with those features
> much more streamlined than before.

## Props

### cols _string_
Sets the column sizes for the table. Uses grid-template-columns.

### color _string_
Sets `$color`

### rowSize _number_
The height of each row. Each row is rendered at the specified height so that
the virtual scrolling can look good.

### headerSize _number_
The height of the header. Defaults to `rowSize`.

### gap / colGap / rowGap
Sets the gap between cells in each direction, with `gap` setting both at the
same time.

### fillHeader _bool_
If true, the header will be filled with color.

## Snippets

### header()
A fragment that should contain the header cells for the table header. A standard
`th` can be used, but the `TH` element from zephyr has additional configuration
to handle more complex header-related actions.

### row(rowData)
A fragment that should use regular `td` elements to define how a row should be
layed out. The fragment will need `let:row` to access each row's data for
displaying it.
