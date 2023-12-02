# Tooltip

Displays a tooltip above (or below) some content when it's hovered.

## Base
[Windstorm Tooltip](https://axel669.github.io/lib.windstorm/#components-tooltip)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### text `string`
    The text to display in the tooltip.
- ### bottom `bool`
    If true, the tooltip will be shown under the content instead of over.

## Usage
```svelte
<Tooltip text="This is a button">
    <Button>Do Thing</Button>
</Tooltip>
<Tooltip text="This shows under" bottom>
    Just some text content
</Tooltip>
```
