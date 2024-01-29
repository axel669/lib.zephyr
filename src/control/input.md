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

### error
If set, shows an error message under the input.

### flat
If true, the input will not have a border. Default is false (with a border).

### hint
Shows a hint under the label of the input.

### type
The type of input. Default to "text".

### value
The value of the input. Can be bound the same way a normal text input value is
bound in Svelte.

### transform
A function to transform the value of the input automatically. Results are put
into the tvalue prop.

### tvalue
The transformed value of the input. Binding should only be used to react to
the value as it will be overriden while a user is typing into the input.

### validate
A function to determine if the value of the input is valid. Results are put into
the `valid` prop. If a transform function is provided, the transformed value
is given to the validation function.

### valid
The result of the validation function. Binding should only be used to react to
the value.

## Instance Functions

### focus
Focuses the input.

## Slots

### end
Puts an element at the end of the input.

### start
Puts an element at the start of the input.

## Example

```svelte
<script>
    import { Input } from "@axel669/zephyr"

    let name = ""
    let ageText = ""
    let age = 0
    let ageValid = false

    $: ageError = ageValid ? "Invalid Age" : null
</script>

<Input bind:value={name} label="Name" />
<Input
    bind:value={ageText}
    transform={v => parseInt(v)}
    bind:tvalue={age}
    validate={age => age > 0}
    bind:valid={ageValid}
    error={ageError}
/>
```
