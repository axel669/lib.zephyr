<script>
    let {
        open = $bindable(false),
        children,
        ws = "",
        onclose,
        animTime,
    } = $props()

    const vis = (node, opts) => {
        const { duration } = opts
        return {
            duration,
            css: (t, u) => "visibility: visible;"
        }
    }

    const close = (evt) => {
        open = false
        onclose?.(evt)
    }
</script>

{#if open === true}
    <ws-modal open data-ws={ws} onclose={close} transition:vis={{ duration: animTime }}>
        {@render children?.()}
    </ws-modal>
{/if}
