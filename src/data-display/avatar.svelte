<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"

    export let alt = ""
    export let image = null

    export let text = ""

    export let color = false

    $: wind = {
        "$color": color,
        ...$$restProps
    }
</script>

<ws-avatar use:wsx={wind}>
    {#if image !== null}
        <img src={image} {alt} />
    {:else}
        {text}
    {/if}
</ws-avatar>
