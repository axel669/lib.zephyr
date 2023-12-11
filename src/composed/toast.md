# Toast

Displays toast notifications along the edge of the screen.

## Props
See the Toaster component. The Toast component is wrapper around it that
also controls the children being shown for convenience.

- ### component
    The component to use as a wrapper for the messages. Defaults to the
    ToastMessage component.

## Functions
- ### show(duration, props)
    Shows a toast notification that will disappear after the specified
    duration (time in milliseconds). The props provided are passed to an
    instance of the component specified in the props.

## Events
- ### action(info)
    Fired when a toast message is clicked. The info argument contains a
    value property that is provided by the message component, and a copy
    of the props passed to that instace.\\
    For the default messages, the value will be `null` if no button was
    clicked, and `true` if the action button was clicked. This allows
    actions to be taken against interactions in the message without having
    to bind all kinds of events or callbacks.

## Example
```js
let toast = null
const notify = () => toast.show(5000, { message: "hi" })
```
```svelte
<Toast bind:this={toast} position="bc" />
```
