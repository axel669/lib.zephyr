<script>
    import wsx from "../wsx.js"
    import variant from "../variant.js"

    const {
        button = false,
        color = false,
        compact = false,
        ground = false,

        href = "",
        rel = "noreferrer",
        target = null,

        fill = false,
        outline = false,
        flat = false,

        disabled = null,

        onclick,
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

    const wind = $derived({
        "@@button": button,
        [type]: true,
        "$color": color,
        $compact: compact,
        $ground: ground,
        ...rest
    })
</script>

<a {href} {target} {rel} disabled={disabled || null} use:wsx={wind} {onclick}>
    {@render children?.()}
</a>
