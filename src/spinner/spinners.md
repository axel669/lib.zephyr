# Spinners
Zephyr exports the CircleSpinner and HexagonSpinner components as wrappers for
windstorms spinners of the same name. Both spinners are svgs with a bit of code
setup as web components.

## Props

### color
Sets the $color macro.

### size
The size of the spinner (width and height). Uses css units.

## Example
```svelte
<script>
    import { HexagonSpinner } from "@axel669/zephyr"
</script>

<HexagonSpinner size="50px" />
<HexagonSpinner size="500px" color="@secondary" />
```
