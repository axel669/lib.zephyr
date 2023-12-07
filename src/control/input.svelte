<script context="module">
    const parseNumeric = (value) => {
        if (value === "") {
            return null
        }
        return parseFloat(value)
    }

    const diff = (type, value, internal) => {
        if ((type !== "number" && type !== "range") || typeof value === "string") {
            return value !== internal
        }
        return parseFloat(internal) !== value
    }
</script>

<script>
    import wsx from "../wsx.mjs"

    export let type = "text"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null
    export let disabled

    export let value = ""

    export let transform = i => i
    export let tvalue
    export let validate = () => true
    export let valid

    let input = null
    let internalValue = value
    export const focus = () => input.focus()

    $: isNumeric = (type === "number" || type === "range")
    $: if (diff(type, value, internalValue) === true) {
        internalValue = value
    }

    const update = (evt) => {
        internalValue = evt.target.value
        value = (isNumeric === true) ? parseNumeric(internalValue) : internalValue
        tvalue = transform(value)
        valid = validate(tvalue)
    }

    $: restKeys = Object.keys($$restProps)
    $: props = restKeys.reduce(
        (props, key) => {
            const [target, name] =
                (key.startsWith("i-") === true)
                ? [props.input, key.slice(2)]
                : [props.wind, key]
            target[name] = $$restProps[key]
            return props
        },
        {wind: {}, input: {}}
    )

    $: wind = {
        "$flat": flat,
        "$control": true,
        "$color": color,
        ...props.wind,
    }

    $: tag = (type === "area") ? "textarea" : "input"
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <svelte:element
        this={tag}
        {...props.input}
        {disabled}
        value={internalValue}
        {type}
        on:focus
        on:blur
        on:input={update}
        bind:this={input}
    />

    <slot name="start" />
    <slot name="end" />
</label>
