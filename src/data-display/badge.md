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
<Badge text="100">
    Unread Messages
</Badge>
<Badge text="1k+" color="warning">
    <button>Clickable Content</button>
</Badge>
```
