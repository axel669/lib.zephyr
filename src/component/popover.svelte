<script>
    const {
        content,
        overlay,
        ws = "",
        ...rest
    } = $props()

    let popover = null
    const show = () => popover.show()
    const hide = () => popover.hide()
</script>

<ws-popover data-ws={ws} {...rest} bind:this={popover}>
    {@render content(show)}
    <ze-popover-overlay slot="popover">
        {@render overlay(hide)}
    </ze-popover-overlay>
</ws-popover>
