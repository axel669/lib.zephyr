<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"
    import variant from "../variant.mjs"

    export let button = false
    export let color = false

    export let href = ""
    export let rel = "noreferrer"
    export let target = null

    export let fill = false
    export let outline = false
    export let flat = false

    $: type = variant({ fill, outline, flat })

    $: wind = {
        "$button": button,
        [type]: true,
        "$color": color,
        ...$$restProps
    }
</script>

<a {href} {target} {rel} use:wsx={wind}>
    <slot />
</a>
