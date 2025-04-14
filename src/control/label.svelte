<script>
    import wsx from "../wsx.js"
    import variant from "../variant.js"

    const {
        color = false,
        compact = false,
        ground = false,
        disabled,

        button = false,
        fill = false,
        outline = false,
        flat = false,
        for:_for = "",

        children,
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
    const baseStyles = $derived(
        (button === true)
        ? {
            "@@button": true,
            [type]: true,
            "$color": color,
            $compact: compact,
            $ground: ground,
        }
        : {}
    )

    const wind = $derived({
        ...baseStyles,
        ...rest
    })
</script>

<label use:wsx={wind} {disabled} for={_for}>
    {@render children?.()}
</label>
