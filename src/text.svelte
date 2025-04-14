<script>
    import wsx from "./wsx.js"

    const { adorn, subtitle, title, children, ...rest } = $props()

    const wind = $derived({
        "$title-text": title,
        "$subtitle-text": subtitle,
        "$adorn": adorn,
        ...rest
    })
</script>

<span use:wsx={wind}>
    {@render children?.()}
</span>
