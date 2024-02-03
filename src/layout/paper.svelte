<svelte:options immutable />

<script>
    import Flex from "./flex.svelte"
    import wsx from "../wsx.mjs"

    export let color
    export let card = false
    export let square = false
    export let layout = Flex
    export let scrollable = true

    $: props = Object.entries($$restProps).reduce(
        (p, [key, value]) => {
            const [target, name] =
                (key.startsWith("l-") === true)
                ? [ p.layout, key.slice(2) ]
                : [ p.paper, key ]
            target[name] = value
            return p
        },
        { layout: {}, paper: {} }
    )

    $: layoutProps = {
        over: scrollable ? "auto" : false,
        ...props.layout,
    }
    $: wind = {
        "$color": color,
        "$outline": card,
        r: square && "0px",
        ...props.paper,
    }
</script>

<ws-paper use:wsx={wind}>
    <slot name="header" />
    {#if $$slots.content}
        <slot name="content" slot="content" />
    {:else}
        <svelte:component this={layout} {...layoutProps} slot="content">
            <slot />
        </svelte:component>
    {/if}
    <slot name="footer" />
</ws-paper>
