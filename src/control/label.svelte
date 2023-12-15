<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"
    import variant from "../variant.mjs"

    export let color = false
    export let compact = false
    export let disabled

    export let fill = false
    export let outline = false
    export let flat = false

    let _for = ""
    export { _for as for }
    export let button = false

    $: type = variant({ fill, outline, flat })
    $: baseStyles =
        (button === true)
        ? {
            $button: true,
            [type]: true,
            "$color": color,
            $compact: compact,
        }
        : {}

    $: wind = {
        ...baseStyles,
        ...$$restProps
    }
</script>

<label use:wsx={wind} {disabled} for={_for}>
    <slot />
</label>
