<script>
    import wsx from "../wsx.js"
    import variant from "../variant.js"

    const {
        color = false,
        compact = false,
        ground = false,
        disabled,

        fill = false,
        outline = false,
        flat = false,
        children,
        onclick,
        ...rest
    } = $props()

    const type = $derived(
        variant(
            "$flat",
            { fill },
            { outline },
            { flat }
        )
    )

    const wind = $derived({
        [type]: true,
        "$color": color,
        $compact: compact,
        $ground: ground,
        ...rest
    })
</script>

<button use:wsx={wind} {disabled} {onclick}>
    {@render children?.()}
</button>
