# ElementToast
Creates an area around an element (or group of elements) where toast messages
can be shown relative to the element rather than relative to the screen. This
means the z-index of the element comes into play for the display (element toasts
that are under a modal in the DOM tree will not show above the modal for
example).

## Props
> Props not defined by the component are passed as windstorm macros to the
> element that contains the toast messages, not the container element.

### component _Component_
The component to use as a wrapper for the messages. Defaults to the
ToastMessage component.

### position _string_
The position relative to the slotted elements. Support `"top"` and `"bottom"`
with the default being `"top"`.

## Functions

### show(duration, props)
> This function is passed to the slotted elements, rather than part of a binding
> like the [#/toast](Toast) component.

Shows a toast notification that will disappear after the specified
duration (time in milliseconds). The props provided are passed to an
instance of the component specified in the props.

## Events

### action
Fired when a toast message is clicked. The info argument contains a
value property that is provided by the message component, and a copy
of the props passed to that instace.

For the default messages, the value will be `null` if no button was
clicked, and `true` if the action button was clicked. This allows
actions to be taken against interactions in the message without having
to bind all kinds of events or callbacks.
