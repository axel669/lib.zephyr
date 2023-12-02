# Flex

Container that uses flex layout by default with some nice default values.

## Base
[Windstorm Flex](https://axel669.github.io/lib.windstorm/#components-flex)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### direction `string`
    Sets `fl-dir`
- ### pad `string`
    Sets `p`
- ### gap `string`
    Sets `gap`
- ### cross `string`
    Sets `fl-cr-a`, default is `"stretch"`
- ### main `string`
    Sets `fl-m-a`, default is `"start"`

## Usage
```svelte
<Flex cross="stretch">
    <Text>Content</Text>
    <Text>More content</Text>
    <Text>Event more content</Text>
<Flex>
```
