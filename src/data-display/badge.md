# Badge
Adds a small badge over the upper-right corner of some content.

## Props

### color
`string`

Sets `$color`

### text
`string`

The badge text.

## Example
```svelte
<script>
    import { Badge } from "@axel669/zephyr"

    let count = 10
</script>

<Badge text={count}>
    Unread Messages
</Badge>
<Badge text="1k+" color="warning">
    <button on:click={() => count += 1}>Clickable Content</button>
</Badge>
```
