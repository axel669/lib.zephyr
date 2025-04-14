<script>
    import wsx from "../wsx.js"
    import variant from "../variant.js"

    let {
        color = "@default",
        clickable = false,

        fill = false,
        outline = false,
        flat = false,
        children,
        onclick,
        ...rest
    } = $props()

    const type = $derived(
        variant(
            "$outline",
            { fill },
            { outline },
            { flat },
        )
    )

    const wind = $derived({
        [type]: true,
        "$color": color,
        "@@click": clickable,
        ...rest
    })
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<ws-chip use:wsx={wind} {onclick} role="button">
    {@render children?.()}
</ws-chip>
