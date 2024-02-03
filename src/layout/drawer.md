# Drawer

A modal container for creating dialogs. The Dialog component is a modal
element that uses a Paper element for the layout of content. All extra props
and slots for the Drawer are passed to the underlying Paper component.

The Drawer component is used as a wrapper for content and is used in
conjunction with the Modal component to be controlled on screen.

## Props

### close
`function`

If passed, this function will be called when the user clicks in the
empty area outside of the drawer contents.

### height
`string`

Sets the height of the select drawer, no effect for menu and action
drawers which default to full height of the window.

### type
`string`

The type of drawer. Default is "menu"
#### "menu"

Makes a drawer that slides in on the left side of the screen

#### "action"

Makes a drawer that slides in on the right side of the screen

#### "select"

Makes a drawer that is centered horizontally and slides in from
the top of the screen

## Example
`cool-drawer.svelte`
```svelte
<script>
    import { Drawer, Titlebar, Text } from "@axel669/zephyr"
</script>

<Drawer>
    <Titlebar slot="header">
        <Text slot="title" title>
            Some Title
        </Text>
    </Titlebar>

    <span>Content</span>
</Drawer>
```

`app.svelte`
```svelte
<script>
    import { Modal, EntryButton } from "@axel669/zephyr"
    import CoolDrawer from "./cool-drawer.svelte"
</script>

<Modal component={CoolDrawer} />
<EntryButton this={Modal} component={CoolDrawer}>
    Open Cool Dialog
</EntryButton>
```
