<script>
    import HexagonSpinner from "./hexagon-spinner.svelte"
    import Flex from "./flex.svelte"

    const {
        component: Component,
        snippet,
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
        <Flex ws="fl.cn;">
            <HexagonSpinner size="56px" />
            <span>Loading</span>
        </Flex>
    {/if}
{:then entries}
    {#if Component}
        <Component {...Object.fromEntries(entries)} />
    {:else}
        {@render snippet(Object.fromEntries(entries))}
    {/if}
{:catch loadError}
    {#if error}
        {@render error(loadError)}
    {:else}
        <Flex ws="b: 1px solid red; fl.cn; p: 8px;">
            {loadError}
        </Flex>
    {/if}
{/await}
