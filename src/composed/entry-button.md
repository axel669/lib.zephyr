# EntryButton

The EntryButton is a convenient way to display modals and screens over
content without needing to bind variables have lots of Modal elements in
addition to the buttons that show them.

## Props

- ### component
    The component to show when clicked
- ### props
    The props to pass to the component when it is shown, or a function that
    generates the props when called
- ### this
    The wrapper for the component. Default is Modal but any component that
    has the same interface as Modal will work

## Events
- ### entry
    When the component is close the entry event is fired. The detail
    property of the event will have the value from closing it

## Example
```svelte
<EntryButton component={Subscreen} on:entry={console.log}>
    Open Subscreen
</EntryButton>
<EntryButton component={CoolDialog} on:entry={console.log}>
    Open Subscreen
</EntryButton>
<EntryButton this={CoolModal} component={CustomThing} on:entry={console.log}>
    Open Subscreen
</EntryButton>
```
