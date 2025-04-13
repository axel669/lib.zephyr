# Input
A component that wraps the text-based input tags. Includes optional outline,
label, hint text, error showing, input validation, input transformation, and
browser level autocomplete.

## Props

### autoCompleteOptions
An array of options to show for auto complete. Uses the browser `datalist`
element to create the auto complete.

### color
Sets the $color macro.

### disabled
Disables the input.

### outline / linedFill / lined / flat _bool_
Sets the input border style using the macros of the same name from windstorm.
If none of them are given, the input has a soft outline that changes color when
focused, whereas when outline is defined, the border always colorized.

### type
The type of input. Default to "text".

### value
The value of the input. Can be bound the same way a normal text input value is
bound in Svelte.

## Instance Functions

### focus
Focuses the input.

## Snippets

### end()
Puts an element at the end of the input.

### start()
Puts an element at the start of the input.

### extra()
Puts an element under the input.

## Events
- input
