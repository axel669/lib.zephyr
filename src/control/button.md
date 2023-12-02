# Button

Basic clickable component for handling user interaction.

## Base
[Windstorm Button](https://axel669.github.io/lib.windstorm/#components-button)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### color `string`
    Sets `$color`
- ### compact `bool`
    Sets `$compact`
- ### for `string`
    The ID of a dom element that the button is tied to. Only works with
    label buttons.
- ### label `string`
    If true, the button will be displayed in the DOM using a `<label>`
    element instead of a `<button>`.
- ### fill / outline `bool`
    Sets the button type to @fill if fill is true, @outline if outline
    is true, or @flat if neither is true.

## Events
- click

## Example
```svelte
<Button on:click={action}>
    Flat Button
</Button>
<Button on:click={action} outline>
    Outlined Button
</Button>
<Button on:click={action} fill color="danger">
    Filled Button
</Button>

<Button label for="thing">
    Toggle
</Button>
<input type="checkbox" id="toggle" />
```
