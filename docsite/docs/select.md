# Select
A highly customizable select built on top of the
[Windstorm Select](https://windstorm.axel669.net/#/component/select.md).

> If setting children directly be sure to use the `ws-option` and and
> `ws-optgroup` elements so that everyuthing renders correctly.

## Props

{{var:children}}

### options _Array_
Each object in the options provided should be in one of 2 forms:
- `{ label, value }`
- `{ group, items }`

Items with a label and value are displayed as `<ws-option>` tags in the select.
Items with a group defined are used to denote `<ws-optgroup>` tags, with the
`items` being rendered recursively using the same rules.

Labels, group names, and values should be strings.

### value _string, bindable_

The value of the selected item.

{{var:ws}}
