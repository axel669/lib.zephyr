# Details
A component that has some baseline content that is shown, then expands to reveal
more content (like the html details element).

## Props

### color
Sets the $color macro.

### label
The text for the content that is always shown.

### open
Controls whether the Details is showing the extended content. Can be bound to.

### outline
If true, will put an outline around the component, including the extended
content.

## Slots

### default
The content to show when the Details is open.

### label
Can be used for more complex labels (things that need nested elements). If used,
the label prop will be ignored.

## Example

```svelte
<script>
    import { Details } from "@axel669/zephyr"

    let open = false
</script>

<div>Open: {open}</div>
<Details label="Info" bind:open>
    Look, more info could go here!
</Details>
```
