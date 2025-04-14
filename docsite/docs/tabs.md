# Tabs
It's tabs, everyone knows what tabs are at this point.

## Props

### color _string_
Sets `$color`

### fill _bool_
Sets `$fill`

### options _Array[Object]_
An array of options where each item is `{ label, value }`. `label`
should be a string, `value` can be of any type.

### t!<prop> _string_
Any prop prefixed with `t!` will be passed to the individual tabs as windstorm
props (without `t!` on them).

### value _any_
The value of the currently selected tab. Can be bound to react to
changes and set to control which tab is selected.

### vertical _bool_
Sets `$vert`
