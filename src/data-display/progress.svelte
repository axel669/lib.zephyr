<script>
    import wsx from "../wsx.js"

    const {
        buffer = 0,
        busy = false,
        color = "@default",
        max = 1,
        min = 0,
        value = 0,
        ...rest
    } = $props()

    const wind = $derived({
        "$color": color,
        ...rest,
    })

    const busyStatus = $derived(
        (busy === true) ? { busy: true } : {}
    )
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<ws-progress use:wsx={wind} {...busyStatus} {min} {max} {value} {buffer} />
