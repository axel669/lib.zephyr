<script>
    import wsx from "../wsx.mjs"
    import variant from "../variant.mjs"

    export let color = false
    export let compact = false
    export let disabled

    export let fill = false
    export let outline = false
    export let flat = false

    $: type = variant({ fill, outline, flat })

    $: wind = {
        [type]: true,
        "$color": color,
        $compact: compact,
        ...$$restProps
    }
</script>

<button use:wsx={wind} {disabled} on:click|stopPropagation>
    <slot />
</button>
