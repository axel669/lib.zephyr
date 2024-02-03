# Dialog

A modal container for creating dialogs. The Dialog component is a modal
element that uses a Paper element for the layout of content. All props and
slots for the Dialog are passed to the underlying Paper component.

The Dialog component is used as a wrapper for content and is used in
conjunction with the Modal component to be controlled on screen.

## Props
This component just wraps a [Paper](./paper.md) component with some extra parts,
and passes the props to a `Paper`.

## Example
`cool-dialog.svelte`
```svelte
<script>
    import { Dialog, Titlebar, Text } from "@axel669/zephyr"
</script>

<Dialog>
    <Titlebar slot="header">
        <Text slot="title" title>
            Some Title
        </Text>
    </Titlebar>

    <span>Content</span>
</Dialog>
```

`app.svelte`
```svelte
<script>
    import { Modal, EntryButton } from "@axel669/zephyr"
    import CoolDialog from "./cool-dialog.svelte"
</script>

<Modal component={CoolDialog} />
<EntryButton this={Modal} component={CoolDialog}>
    Open Cool Dialog
</EntryButton>
```
