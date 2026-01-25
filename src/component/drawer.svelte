<script>
    import Modal from "./modal.svelte"

    let {
        open = $bindable(false),
        ws = "",
        children,
        onclose,
    } = $props()
</script>

<Modal bind:open {onclose}>
    <ws-drawer data-ws={ws}>
        {@render children?.()}
    </ws-drawer>
</Modal>
