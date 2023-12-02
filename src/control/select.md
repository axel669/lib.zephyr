# Select

A wrapper for select elements to make them look nicer.

## Base
[Windstorm Labeled Control](https://axel669.github.io/lib.windstorm/#components-labeled control)
using a `<select>`

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### color `string`
    Sets `$color`
- ### label `string`
    The text to display as the label
- ### options `Array[Object]`
    An array of options and groups to show in the select. Details below
- ### outline `bool`
    Sets `@outline`
- ### value `any`
    The value currently selected. Can be bound to react to selections or
    change the current selection.

## Options
Each object in the options provided should be in one of 2 forms:
- `{ label, value }`
- `{ group }`

Items with a label and value are displayed as <option> tags in the select.
Items with a group defined are used to denote <optgroup> tags. Each option
after a `{ group }` item until another group item is seen (or the end of the
array) is put into the optgroup defined by the group item.

Labels and group names should be strings, but values can be any type.

## Usage
```js
// Results in:
// <option>first</option>
// <optgroup label="Not Numbers">
//     <option>second</option>
//     <option>third</option>
// </optgroup>
const options = [
    { label: "first", value: 1 },
    { group: "Not numbers" },
    { label: "second", value: "two" },
    { label: "third", value: [3] },
]
```
```svelte
<Select {options} bind:value label="Blep" />
<Select {options} bind:value color="warning" label="Why" />
```
