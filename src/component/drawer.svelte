<script>
    import { fly } from "svelte/transition"
    import Modal from "./modal.svelte"

    let {
        open = $bindable(false),
        ws = "",
        children,
        onclose,
        animTime = 250,
        tr = fly,
        trArgs = { x: "-100%" }
    } = $props()
</script>

<Modal bind:open {onclose} {animTime}>
    <ws-drawer transition:tr={{ ...trArgs, duration: animTime }} data-ws={ws}>
        {@render children?.()}
    </ws-drawer>
</Modal>
