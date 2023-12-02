<script context="module">
    let topClose = null
</script>

<script>
    import { tick } from "svelte"

    export let component

    let modalProps = null
    let resolver = null
    let displayed = null

    const close = (value) => {
        resolver(value)
        resolver = null
        modalProps = null
        visible.checked = false
        if (topClose !== close) {
            return
        }
        topClose = null
    }
    const closeToTop = (value) => {
        topClose(value)
    }
    const cancel = () => displayed.cancel?.()

    export const show = (props) => new Promise(
        async (resolve) => {
            modalProps = props ?? {}
            resolver = resolve
            topClose = topClose ?? close
            await tick()
            setTimeout(
                () => visible.checked = true,
                0
            )
        }
    )

    let visible = null
</script>

<input type="checkbox" bind:this={visible} ws-x="disp[none]" />
{#if resolver !== null}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <ws-modal on:click={cancel} role="dialog">
        <svelte:component
        bind:this={displayed}
        this={component}
        {...modalProps}
        {close}
        {closeToTop}
        />
    </ws-modal>
{/if}
