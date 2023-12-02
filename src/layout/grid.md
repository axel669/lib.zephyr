# Grid

Container that uses grid layout by default with some nice default values.

## Base
[Windstorm Grid](https://axel669.github.io/lib.windstorm/#components-grid)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### direction `string`
    Sets `gr-dir`
- ### pad `string`
    Sets `p`
- ### gap `string`
    Sets `gap`
- ### cols `string|Array`
    Sets `gr-col`. Accepts either an array of values that are joined by " "
    or a regular string value.
- ### rows `string|Array`
    Sets `gr-row`. Accepts either an array of values that are joined by " "
    or a regular string value.
- ### autoCol `string`
    Sets `gr-acol`
- ### autoRow `string`
    Sets `gr-arow`

## Usage
```svelte
<Grid cross="stretch">
    <Text>Content</Text>
    <Text>More content</Text>
    <Text>Event more content</Text>
<Grid>
```
