# Paper
The Paper component is a container that has slots for header and footer
content that is independant from the regular content scrolling. It also uses
Flex as a default layout for its slotted content, but allows any container
to be used as a layout without increasing the indentation of all the content
needlessly.

## Props

### layoutWS _string_
A Windstorm string to pass into the layout component. Only used when children()
are supplied (since the content() snippet allows direct control already).

{{var:ws}}

## Snippet

{{var:children}}

### header()
The header content for the Paper. Header content does not scroll with
the regular content of the component (acts sticky).

### footer()
The footer content for the Paper. Same scrolling properties as the
header slot.

### content()
If this snippet is passed, it is used as is without the normal layout wrapper
provided by the component.
