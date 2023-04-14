<script>
    import wsx from "../wsx.mjs"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null

    export let value = ""

    export let transform = i => i
    export let tvalue
    export let validate = () => true
    export let valid

    let area = null
    export const focus = () => area.focus()

    $: wind = {
        "@flat": flat,
        "@control": true,
        $color: color,
        ...$$restProps,
    }

    $: tvalue = transform(value ?? "")
    $: valid = validate(tvalue)
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <textarea {...$$restProps} bind:value on:focus on:blur bind:this={area} />

    <slot name="start" />
    <slot name="end" />
</label>
