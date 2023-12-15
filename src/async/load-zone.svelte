<svelte:options immutable />

<script>
    import Spinner from "../spinner/hexagon-spinner.svelte"
    export let source = null
    export let message = "Loading"
</script>

{#if source !== null}
    {#await source}
        <slot name="loading">
            <ws-flex ws-x="fl.cross[center] fl.main[center]">
                <span>{message}</span>
                <Spinner size="100px" />
            </ws-flex>
        </slot>
    {:then result}
        <slot {result} />
    {/await}
{/if}
