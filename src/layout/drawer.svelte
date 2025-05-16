<script module>
    const defs = {
        select: {
            "@@select": true,
            "w.min": "35vw",
            grid: true,
            over: "hidden"
        },
        menu: {
            "@@menu": true,
        },
        action: {
            "@@action": true,
        }
    }
    const parseTime = (timestring) => {
        if (!timestring) {
            return 200
        }
        const { base, scale } =
            timestring.match(/(?<base>\d+)(?<scale>s|ms)/)?.groups ?? {}
        if (base === undefined) {
            return 200
        }
        const numeric = parseInt(base)
        if (scale === "ms") {
            return numeric
        }
        return numeric * 1000
    }
</script>

<script>
    import wsx from "../wsx.js"

    import Paper from "./paper.svelte"
    import { modalAnimTime } from "./modal.svelte"

    const {
        height,
        type = "menu",
        ...rest
    } = $props()

    const animTime = modalAnimTime()

    // When Svelte removes things from the DOM they are removed immediately
    // unless Svelte has a transition running. Adding this prevents the drawer
    // from disappearing without first letting the built in animations run.
    const trick = (node, options) => ({
        delay: 0,
        duration: parseTime($animTime),
        css: () => "",
    })

    const container = $derived({
        ...defs[type],
        $show: true,
        h: (type === "select") ? height : "100%",
        grid: true,
    })
    const onclick = (evt) => evt.stopPropagation()
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<wind-drawer-container use:wsx={container} {onclick} role="menubar"
transition:trick>
    <Paper r="0px" {...rest} />
</wind-drawer-container>
