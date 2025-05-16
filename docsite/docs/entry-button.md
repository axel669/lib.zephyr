# EntryButton
The EntryButton is a convenient way to display modals and screens over
content without needing to bind variables have lots of Modal elements in
addition to the buttons that show them.

## Props
Any props passed that are not listed for the `EntryButton` are passed to the
`Button` component that is wrapped by this component.

### m!&lt;prop> _any_
Props starting with "m!" will be passed to the modal being managed by the
EntryButton (without the m! in the passed prop name).

## Events

### open
Just before the component is shown this event is fired so if there are any
props that need to be set at that time, they can be without weird or complex
methods on the components.

### entry
When the component is closed the entry event is fired. The detail
property of the event will have the value from closing it.

## Snippets

### modal _Component_
The modal component to show when the button is clicked.
