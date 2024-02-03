# Toaster

The Toaster component is used for building popup notifications along the
edges of the window.

## Props

### position
Sets position of the toaster. See the
[windstorm base](https://windstorm.axel669.net/lib/css/component/toaster)
for values.

## Example
```svelte
<script>
    import { Toaster, Notification, Icon } from "@axel669/zephyr"
</script>

<Toaster position="$tc">
    <Notification>
        <Icon name="info">
            Some kind of notification of things
        </Icon>
    </Notification>
</Toaster>
```
