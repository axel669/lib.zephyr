<script>
    import wsx from "../wsx.js"

    const {
        direction = false,
        cols = null,
        rows = null,
        autoCol = false,
        autoRow = false,
        colsFit = false,
        colsFill = false,
        scrollable = false,
        children,
        ...rest
    } = $props()

    const wind = $derived({
        "gr.flow": direction,
        "gr.cols": cols?.join?.(" ") ?? cols ?? false,
        "gr.rows": rows?.join?.(" ") ?? rows ?? false,
        "gr.cols.a": autoCol,
        "gr.rows.a": autoRow,
        "gr.cols-fit": colsFit,
        "gr.cols-fill": colsFill,
        over: (scrollable === true) ? "auto" : null,
        ...rest
    })
</script>

<ws-grid use:wsx={wind}>
    {@render children?.()}
</ws-grid>
