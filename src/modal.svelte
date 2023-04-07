<script>
    export let component

    let modalProps = null
    let resolver = null

    const close = (value) => {
        resolver(value)
        resolver = null
        modalProps = null
    }

    export const show = (props) => new Promise(
        (resolve) => {
            modalProps = props ?? {}
            resolver = resolve
        }
    )
</script>

{#if resolver !== null}
    <svelte:component this={component} {...modalProps} {close} />
{/if}
