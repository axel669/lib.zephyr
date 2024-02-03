# Icon

Displays a [Tabler Icon](https://tabler-icons.io/) and some optional text.
The icon will appear at the beginning of the text.

## Props

### name
`string`

The name of the icon. Use the tabler icon class name without the "ti-".

## Example
```svelte
<script>
    import { Icon } from "@axel669/zephyr"
</script>

<Icon name="hexagon" />
<Icon name="hexagons">Are the bestagons</Icon>
```
