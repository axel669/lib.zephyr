<svelte:options immutable />

<script context="module">
    const sortIcons = {
        "asc": "arrow-up",
        "desc": "arrow-down",
    }
</script>

<script>
    import { getContext } from "svelte"

    import Button from "../../control/button.svelte"
    import Grid from "../../layout/grid.svelte"
    import Icon from "../../info/icon.svelte"

    import wsx from "../../wsx.mjs"
    import { dtContext } from "../data-table.svelte"

    export let sort = null
    export let filter = null

    const context = getContext(dtContext)

    const setSort = () => $context.updateSort(sort)

    let value = ""
    $: $context.updateFilter(filter, value)

    $: wind = {
        ...$$restProps,
        p: "0px",
        sel: "none"
    }
    $: sortIcon =
        ($context.sorting.base === sort)
        ? sortIcons[$context.sorting.direction]
        : "arrow-down-up"
</script>

<th use:wsx={wind} style="vertical-align: top;">
    <Grid rows="40px min-content" p="0px" gap="0px">
        {#if sort === null}
            <div ws-x="[flex] [fl.cross center] [fl.main center]">
                <slot />
            </div>
        {:else}
            <Button compact r="0px" color="primary" fill={$context.fillHeader}
            t.wt="inherit" on:click={setSort}>
                <slot />
                <Icon name={sortIcon} m.l="4px" t.sz="16px" />
            </Button>
        {/if}
        {#if filter !== null}
            <Grid gap="0px" p="0px" cols="min-content 1fr">
                <Icon name="filter" />
                <input type="text" ws-x="[w.min 20px] [outln:focus none]" bind:value />
            </Grid>
        {/if}
    </Grid>
</th>
