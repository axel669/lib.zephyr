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
The center of the titlebar, where the text usually goes. Elements can be nested
in different ways within a parent element for different visual effects in this
slot.

### menu
The area on the left of the titlebar (where drawer menus tend to open)

### action
The area on the right of the titlebar

## Example
```svelte
<script>
    import { Titlebar, Button, Paper, Text } from "@axel669/zephyr"
</script>

<Titlebar color="primary" fill>
    <Text title slot="title">
        Some Title
    </Text>

    <Button slot="menu">
        <Icon name="menu" />
    </Button>
</Titlebar>

<Paper>
    <Titlebar color="secondary" slot="header">
        <Text title slot="title">
            Paper Title
            <Text subtitle>
                Indented Subtitle
            </Text>
        </Text>
    </Titlebar>
</Paper>

<Paper>
    <Titlebar color="secondary" slot="header">
        <Flex p="0px" slot="title">
            <Text title>
                Paper Title
            </Text>
            <Text subtitle>
                Aligned Subtitle
            </Text>
        </Flex>

        <Button slot="action">
            <Icon name="menu" />
        </Button>
    </Titlebar>
</Paper>
```
