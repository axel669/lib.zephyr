<script>
    import wsx from "./wsx.mjs"

    export let button = false
    export let variant = "flat"
    export let color = "default"

    export let href = ""
    export let target = null

    $: wind = {
        "@button": button,
        [`@${variant}`]: true,
        $color: color,
        ...$$restProps
    }
</script>

<a {href} {target} use:wsx={wind}>
    <slot />
</a>
