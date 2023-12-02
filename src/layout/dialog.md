# Dialog

A modal container for creating dialogs. The Dialog component is a modal
element that uses a Paper element for the layout of content. All props and
slots for the Dialog are passed to the underlying Paper component.

The Dialog component is used as a wrapper for content and is used in
conjunction with the Modal component to be controlled on screen.

## Props
See the Paper component props.

## Usage
`cool-dialog.svelte`
```svelte
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
<Modal component={CoolDialog} />
<EntryButton this={Modal} component={CoolDialog}>
    Open Cool Dialog
</EntryButton>
```
