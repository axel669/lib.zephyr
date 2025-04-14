<script>
    import wsx from "../wsx.js"

    const {
        size = "100px",
        color = "@primary",
        ...rest
    } = $props()

    const wind = $derived({
        ...rest,
        "@size": size,
        "$color": color,
    })
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<ws-hexagon-spinner use:wsx={wind} style="aspect-ratio: 1 / 1;" />
