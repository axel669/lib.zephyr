<script>
    import wsx from "../wsx.js"

    const {
        direction = false,
        cross = "stretch",
        main = "start",
        scrollable = false,
        children,
        ...rest
    } = $props()

    const wind = $derived({
        "fl.dir": direction,
        "fl.cross": cross,
        "fl.main": main,
        over: (scrollable === true) ? "auto" : null,
        ...rest
    })
</script>

<ws-flex use:wsx={wind}>
    {@render children?.()}
</ws-flex>
