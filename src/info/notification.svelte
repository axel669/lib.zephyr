<script>
    import wsx from "../wsx.mjs"

    export let color = false

    $: wind = {
        "$color": color,
        ...$$restProps,
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<ws-notification use:wsx={wind} on:click role="button">
    <slot />
</ws-notification>
