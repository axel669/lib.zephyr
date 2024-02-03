# Link

Themed and customizale `<a>` tag component.

## Props

### button `string`

If true, the link will be styled like a button

### color
`string`

Sets the color of the button. Applies to both regular links and button
style links.

### href
`string`

Sets the href attribute.

### rel
`string`

Sets the rel attribute.

### target
`string`

Sets the target attribute.

### fill / outline / flat
`bool`

Sets the link-button type to `$fill` if fill is true, `$outline` if outline
is true, or `$flat` if neither is true.

## Example
```svelte
<script>
    import { Link } from "@axel669/zephyr"
</script>

<Link color="primary" href="test" target="_blank">
    Test
</Link>
<Link color="primary" href="logout" button outline>
    Logout
</Link>
```
