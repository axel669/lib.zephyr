# Avatar

Displays an image or text in a circular container.

## Props

### alt
`string`

Alt text for the image. Has no effect if image prop is not used.

### color
`string`

Sets `$color`

### image
`string`

An image url. If no url is provided the text property is displayed.

### text
`string`

Text to show in the avatar area if image is not used.

## Example
```svelte
<script>
    import { Avatar } from "@axel669/zephyr"
</script>

<Avatar image="url" />
<Avatar image="url" alt="text" />
<Avatar text="Hi" color="primary" />
```
