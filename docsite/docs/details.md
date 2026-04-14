# Details
A component that has some baseline content that is shown, then expands to reveal
more content (like the html details element).

## Props

### label _string_

The text to display in the summary of the details.

### summaryWS _string_

Windstorm string to apaply to the summary element of the details.

{{var:ws}}

## Snippets

{{var:children}}

### summary()
Can be used for more complex labels (things that need nested elements). If used,
the label prop will be ignored.
