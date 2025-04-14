# Toggle
The Toggle component is used to display checkboxes and switches.

## Props

### color _string_
Sets `$color`

### checkbox _bool_
If true, the toggle is displayed as a checkbox. Default is false
(shown as a switch)

### checked _bool_
Controls if the toggle is checked or not. Can be bound.

### flat _bool_
Sets `$flat`

### group
Used for binding, see the
[Svelte bind:group](https://svelte.dev/docs/element-directives#bind-group)
for details.

### label _string_
The text to use for the label

### reverse _bool_
If true, the input being toggled will be on the left instead of the
right. Default is false (label is on the left)

### value _any_
Only used in conjunction with bind:group, see Svelte docs
