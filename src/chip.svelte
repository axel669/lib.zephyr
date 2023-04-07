<script>
    import wsx from "./wsx.mjs"

    export let color = "default"
    export let variant = "outline"
    export let click = false

    $: wind = {
        [`@${variant}`]: true,
        $color: color,
        $click: click,
        ...$$restProps
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-chip use:wsx={wind} on:click>
    <slot />
</ws-chip>
