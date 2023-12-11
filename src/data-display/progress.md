# Progress

Displays progress bar with an optional label.

## Props

### color
`string`

Sets `$color`

### label
`string`

The label for the bar

### max
`number`

Sets the max value for the progress bar. Default is 1

### outline
`bool`

Sets `$outline`

### row
`bool`

Sets `$row`

### value
`number`

Sets the value of the progress bar. Combined with max to determine how
filled the bar is.

## Example
```svelte
<Progress color="primary" value={0.1} />
<Progress color="primary" value={5} max={10} />
```
