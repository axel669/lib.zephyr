<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"
    import variant from "../variant.mjs"

    export let color = "@default"
    export let clickable = false

    export let fill = false
    export let outline = false
    export let flat = false

    $: type = variant({ fill, flat, outline }, "$outline")

    $: wind = {
        [type]: true,
        "$color": color,
        $click: clickable,
        ...$$restProps
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<ws-chip use:wsx={wind} on:click role="button">
    <slot />
</ws-chip>
