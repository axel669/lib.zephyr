<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"

    export let label
    export let outline
    export let color = "default"
    export let open = false

    $: wind = {
        "$color": color,
        "$outline": outline,
        ...$$restProps,
    }
</script>

<details use:wsx={wind} bind:open>
    <summary>
        <slot name="label">
            {label}
        </slot>
    </summary>
    <slot />
</details>
