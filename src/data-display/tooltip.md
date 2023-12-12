# Tooltip

Displays a tooltip above (or below) some content when it's hovered.

## Props

### text
`string`

The text to display in the tooltip.

### bottom
`bool`

If true, the tooltip will be shown under the content instead of over.

## Example
```svelte
<script>
    import { Tooltip, Button } from "@axel669/zephyr"
</script>

<Tooltip text="This is a button">
    <Button>Do Thing</Button>
</Tooltip>
<Tooltip text="This shows under" bottom>
    Just some text content
</Tooltip>
```
