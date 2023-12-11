# Button

Basic clickable component for handling user interaction.

## Props

### color
`string`

Sets `$color`

### compact
`bool`

Sets `$compact`

### fill / outline
`bool`

Sets the button type to `$fill` if fill is true, `$outline` if outline
is true, or `$flat` if neither is true.

## Events
- click

## Example
```svelte
<Button on:click={action}>
    Flat Button
</Button>
<Button on:click={action} outline>
    Outlined Button
</Button>
<Button on:click={action} fill color="danger">
    Filled Button
</Button>
```
