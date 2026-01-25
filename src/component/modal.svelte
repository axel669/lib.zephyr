<script>
    let {
        open = $bindable(false),
        children,
        ws = "",
        onclose,
    } = $props()

    const close = (evt) => {
        open = false
        onclose(evt)
    }
</script>

<ws-modal {open} data-ws={ws} onclose={close}>
    {@render children?.()}
</ws-modal>
