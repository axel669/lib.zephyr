# Chip

Shows a small piece of information that is separate from the surrounding
info and optionally allows interaction.

## Props

### color
`string`

Sets `$color`

### clickable
`bool`

If true, the chip will have the button ripple effect when clicked.

### fill
`bool`

If true, sets $fill on the chip. If false $outline is set instead.

## Events
- click

## Example
```svelte
Emails:
<Chip clickable>admin@site.com</Chip>
<Chip clickable color="warning">weirdge@site.com</Chip>
<Chip color="primary" fill>required@site.io</Chip>
```
