<script module>
    const groupOptions = (options) => options.reduce(
        ({grouped, target = grouped}, item, pos) => {
            const opt = { ... item, pos }
            if (item.group === undefined) {
                target.push(opt)
                return { grouped, target }
            }
            const next = [opt]
            grouped.push(next)
            return { grouped, target: next }
        },
        { grouped: [] }
    ).grouped
</script>

<script>
    import wsx from "../wsx.js"

    let {
        disabled = false,
        color = "@default",
        flat = false,
        label = null,
        options = [],
        value = $bindable(),
        ...rest
    } = $props()

    const update = (evt) => value = options[evt.target.value].value

    const indexValue = $derived(
        options.findIndex(item => item.value === value)
    )

    const grouped = $derived(
        groupOptions(options)
    )

    const wind = $derived({
        "@@control": true,
        "$flat": flat,
        "$color": color,
        ...rest,
    })
</script>

<label use:wsx={wind}>
    {#if label}
        <span ws-x="[$label]">{label}</span>
    {/if}
    <select value={indexValue} oninput={update} {disabled}>
        {#each grouped as item, index}
            {#if Array.isArray(item) === false}
                <option value={item.pos}>
                    {item.label}
                </option>
            {:else}
                <optgroup label={item[0].group}>
                    {#each item.slice(1) as subitem, subindex}
                        <option value={subitem.pos}>
                            {subitem.label}
                        </option>
                    {/each}
                </optgroup>
            {/if}
        {/each}
    </select>
</label>
