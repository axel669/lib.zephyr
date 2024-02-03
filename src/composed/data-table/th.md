# TH

The TH component has no use outside fo the DataTable, but is used to support
the filter and sorting functionality for that component.

## Props

### sort
`Function`

The sorting function to use for the column defined. Should return values that
match the expected values for `Array.sort`.

### filter
`Function`

The function to use for filtering based on the column. The function is given
2 arguments: a row of data and the text from the filter input field. The
function should return `true` if the item should be shown. A filter function on
a specific column does not need to only look at the specified column, but not
doing could cause confusion for users without proper context.
