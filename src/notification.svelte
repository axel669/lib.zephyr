<script>
    import wsx from "./wsx.mjs"

    export let color = false

    $: wind = {
        $color: color,
        ...$$restProps,
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-notification use:wsx={wind} on:click>
    <slot />
</ws-notification>
