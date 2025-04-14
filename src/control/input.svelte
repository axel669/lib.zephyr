<script>
    import wsx, { none } from "../wsx.js"
    import variant from "../variant.js"
    import { splitProps } from "../props.js"

    let {
        type = "text",

        flat = false,
        lined = false,
        linedFill = false,
        outline = false,
        label,
        color = "@default",
        disabled,

        value = $bindable(""),
        autocompleteOptions = null,

        start,
        end,
        extra,

        oninput,
        ...rest
    } = $props()

    let input = $state(null)
    export const focus = () => input.focus()

    const id =
        (autocompleteOptions === null)
        ? null
        : `${Math.random().toString(16)}_${Date.now()}`

    const prop = splitProps(rest, "i!")

    const variantStyle = $derived(
        variant(
            none,
            { outline },
            { linedFill },
            { lined },
            { flat }
        )
    )

    const wind = $derived({
        [variantStyle]: true,
        "@@control": true,
        "$color": color,
        ...prop.rest,
    })

    const tag = $derived(
        (type === "area") ? "textarea" : "input"
    )

    const update = (evt) => {
        value = evt.target.value
        oninput?.(evt)
    }
</script>

<label use:wsx={wind}>
    {#if label}
        <span use:wsx={{ "$label": true }}>{label}</span>
    {/if}
    <svelte:element
        this={tag}
        {...prop.input}
        {disabled}
        {type}
        {value}
        oninput={update}
        list={id}
        bind:this={input}
    />

    {#if start}
        <span use:wsx={{ "$start": true }}>
            {@render start()}
        </span>
    {/if}
    {#if end}
        <span use:wsx={{ "$end": true }}>
            {@render end()}
        </span>
    {/if}
    {#if extra}
        <span use:wsx={{ "$extra": true }}>
            {@render extra()}
        </span>
    {/if}

    {#if autocompleteOptions !== null}
        <datalist {id}>
            {#each autocompleteOptions as value}
                <option {value}>{value}</option>
            {/each}
        </datalist>
    {/if}
</label>
