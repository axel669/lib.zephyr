# Drawer
A modal container for creating dialogs. The Drawer component is a modal
element that uses a Paper element for the layout of content. The Drawer slides
in and out from a region of the screen determined by the `type`.

The Drawer component is used as a wrapper for content and is used in
conjunction with the Modal component to be controlled on screen.

## Props
All props not listed are passed into the underlying Paper component.

### height _string_
Sets the height of the select drawer, no effect for menu and action
drawers which default to full height of the window.

### type _string_
The type of drawer. Default is "menu"

#### "menu"
Makes a drawer that slides in on the left side of the screen

#### "action"
Makes a drawer that slides in on the right side of the screen

#### "select"
Makes a drawer that is centered horizontally and slides in from
the top of the screen

## Snippets
The drawer uses a [Paper](#/paper) to display the drawer contents, so the
snippets used by that element are also used here.
