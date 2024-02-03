# AsyncButton
A button that makes it simpler to fire off async functions in response to button
clicks. In addition to calling the function, the button will disable itself
during the function duration and show a load spinner inside the button.

## Props
The AsyncButton supports all of the [Button](../control/button.md) props.

### handler
The async function to call when the button is clicked.

## Example

```svelte
<script>
    import { AsyncButton } from "@axel669/zephyr"

    const load = async () => {
        const res = await fetch(someURL)
        console.log(await res.text())
    }
</script>

<AsyncButton handler={load} color="@primary">
    Load Things
</AsyncButton>
```
