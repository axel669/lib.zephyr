# Label

The label component is a wrapper around a `<label>` element.

## Props

### button
`bool`

If true, the label will have the button appearance.

### color
`string`

Sets `$color`

### compact
`bool`

If true, will make the label button be more compact. No effect is `button` is
`false`.

### disabled
`bool`

Disables the label.

### fill / outline / flat
`bool`

Sets the button variant of the label when `button` is `true`.

### for
`string`

[Label for attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#for)

## Example

```svelte
<script>
    import { Label } from "@axel669/zephyr"
</script>

<Label for="checkbox">Toggle Checkbox</Label>
<Label for="checkbox" button color="primary" fill>
    Open Menu
</Label>
```
