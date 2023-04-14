<script>
    import wsx from "../wsx.mjs"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null

    export let value

    export let validate = () => true
    export let valid

    const handler = (evt) => value = [...evt.target.files]

    $: wind = {
        "@flat": flat,
        "@control": true,
        $color: color,
        ...$$restProps,
    }

    $: valid = validate(value)
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <input {...$$restProps} type="file" on:input={handler} />

    <slot name="start" />
    <slot name="end" />
</label>
