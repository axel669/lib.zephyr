# Titlebar

The titlebar is used to set section titles with some style, and provides
slots for buttons on either side of the title text. Works well as a header
for Paper components.

## Props

### color
`string`

Sets `$color`

### fill
`bool`

Sets `$fill`

## Slots

### title
The center of the titlebar, where the text usually goes

### menu
The area on the left of the titlebar (where drawer menus tend to open)

### action
The area on the right of the titlebar

## Example
```svelte
<Titlebar color="primary" fill>
    <Text title slot="title">
        Some Title
    </Text>

    <Button slot="menu" color={false}>
        <Icon name="menu" />
    </Button>
</Titlebar>

<Paper>
    <Titlebar color="secondary" slot="header">
        <Text title slot="title">
            Paper Title
        </Text>
    </Titlebar>
</Paper>
```
