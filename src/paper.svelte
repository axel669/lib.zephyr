<script>
    import Flex from "./flex.svelte"
    import wsx from "./wsx.mjs"

    export let color
    export let card = false
    export let square = false
    export let layout = Flex
    export let scrollable = false
    export let lprops = {}

    $: props = {
        over: scrollable ? "auto" : false,
        ...lprops,
    }
    $: wind = {
        $color: color,
        "@outline": card,
        r: square && "0px",
        ...$$restProps
    }
</script>

<ws-paper use:wsx={wind}>
    <slot name="header" />
    {#if $$slots.content}
        <slot name="content" />
    {:else}
        <svelte:component this={layout} {...props}>
            <slot />
        </svelte:component>
    {/if}
    <slot name="footer" />
</ws-paper>
