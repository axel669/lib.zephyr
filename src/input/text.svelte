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

    let input = null
    export const focus = () => input.focus()

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
    <input {...$$restProps}
    type="text"
    bind:value
    on:focus
    on:blur
    bind:this={input}
    />

    <slot name="start" />
    <slot name="end" />
</label>