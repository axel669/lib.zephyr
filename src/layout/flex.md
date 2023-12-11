# Flex

Container that uses flex layout by default with some nice default values.

## Props

### direction
`string`

Sets `fl.dir`

### pad
`string`

Sets `p`

### gap
`string`

Sets `gap`

### cross
`string`

Sets `fl.cross`, default is `"stretch"`

### main
`string`

Sets `fl.main`, default is `"start"`

## Example
```svelte
<Flex cross="stretch">
    <Text>Content</Text>
    <Text>More content</Text>
    <Text>Event more content</Text>
<Flex>
```
