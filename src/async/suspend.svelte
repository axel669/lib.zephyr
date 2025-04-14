<script>
    import CircleSpinner from "../spinner/circle-spinner.svelte"

    const {
        "!component": Component,
        loading,
        error,
        ...rest
    } = $props()
    const wait = $derived(
        Promise.all(
            Object.entries(rest).map(
                async (pair) => [pair[0], await pair[1]]
            )
        )
    )
</script>

{#await wait}
    {#if loading}
        {@render loading()}
    {:else}
        <div ws-x="[flex] [fl-center] [p 4px]">
            <CircleSpinner size="56px" />
            <span>Loading</span>
        </div>
    {/if}
{:then entries}
    <Component {...Object.fromEntries(entries)} />
{:catch loadError}
    {#if error}
        {@render error(loadError)}
    {:else}
        <div ws-x="[b 1px solid red] [p 8px]">
            {loadError}
        </div>
    {/if}
{/await}
