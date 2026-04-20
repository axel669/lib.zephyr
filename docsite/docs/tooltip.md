# Tooltip
Displays a tooltip above (or below) some content when it's hovered.

> NOTE: The tooltip renders content in the same layer as the content, so make
> sure the tooltip text appears in an area that is not covered by other content
> or hidden by overflow clipping.

## Props

### pos _string_
The position the tooltip is in relative to the content. Allowed values are:
`top`, `right`, `bottom`, and `left`.

### text _string_
The text to display in the tooltip.

{{var:ws}}

## Snippets

### children()
The content to show the tooltip around.
