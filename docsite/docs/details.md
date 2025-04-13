# Details
A component that has some baseline content that is shown, then expands to reveal
more content (like the html details element).

## Props

### color _string_
Sets the $color macro.

### label _string_
The text for the content that is always shown.

### open _bool_
Controls whether the Details is showing the extended content. Can be bound to.

### outline _bool_
If true, will put an outline around the component, including the extended
content.

## Snippets

### default()
The content to show when the Details is open.

### label()
Can be used for more complex labels (things that need nested elements). If used,
the label prop will be ignored.
