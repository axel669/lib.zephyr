# Popover

The Popover component is for displaying content over something without it
being modal (you can interact with things under it still).

## Variables
- show
- hide
The Popover exposes 2 variables for use: `show` and `hide`. These functions
are given to the content so that it can control when to display the popover
content without needing to bind to the parent.

> Beacuse the hide function is given to a named slot, the `let:hide` declaration
> needs to be on the slotted element.

## Example
```svelte
<script>
    import { Popover, Button } from "@axel669/zephyr"
</script>

<Popover let:show>
    <Button on:click={show}>
        Show
    </Button>
    <div ws-x="inset-x[0px] y[0px] h[100px] bg[teal]" slot="content" let:hide>
        <Button on:click={hide}>
            Hide
        </Button>
    </div>
</Popover>
```
