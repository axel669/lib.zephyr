<script>
    import Spinner from "../spinner/hexagon-spinner.svelte"
    export let source = null
</script>

{#if source !== null}
    {#await source}
        <slot name="loading">
            <ws-flex ws-x="fl.cross[center] fl.main[center]">
                <span>Loading</span>
                <Spinner size="100px" />
            </ws-flex>
        </slot>
    {:then result}
        <slot {result} />
    {/await}
{/if}
