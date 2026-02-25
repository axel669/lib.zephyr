<script>
    import { onMount } from "svelte"
    import Modal from "./modal.svelte"

    const {
        options,
        dialog,
    } = $props()

    let open = $state(false)

    onMount(() => open = true)

    const {
        tIn,
        tOut,
        close,
        ws = "",
        persistent,
        ...opts
    } = options
    const dialogClose = (value) => {
        open = false
        setTimeout(
            () => close(value),
            tOut.duration
        )
    }
</script>

<Modal bind:open inTime={0} outTime={tOut.duration} onclose={() => dialogClose(null)} {persistent}>
    <ws-dialog in:tIn.func={tIn} out:tOut.func={tOut} data-ws={ws}>
        {@render dialog({ ...opts, close: dialogClose })}
    </ws-dialog>
</Modal>
