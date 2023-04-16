<script>
    import wsx from "./wsx.mjs"

    export let variant = "flat"
    export let color = "default"
    export let compact = false
    export let label = false
    let _for = ""
    export { _for as for }

    $: wind = {
        [`@${variant}`]: true,
        $color: color,
        $compact: compact,
        "@button": label,
        ...$$restProps
    }
</script>

{#if label === true}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <label use:wsx={wind} for={_for} on:click|stopPropagation>
        <slot />
    </label>
{:else}
    <button use:wsx={wind} on:click|stopPropagation>
        <slot />
    </button>
{/if}
