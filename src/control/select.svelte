<svelte:options immutable />

<script context="module">
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
    import wsx from "../wsx.mjs"

    export let options = []
    export let value
    export let color = "default"
    export let outline = false
    export let label = null
    export let disabled = false

    const update = (evt) => value = options[evt.target.value].value

    $: indexValue = options.findIndex(item => item.value === value)

    $: grouped = groupOptions(options)

    $: wind = {
        "$control": true,
        "$outline": outline,
        "$color": color,
        ...$$restProps,
    }
</script>

<label use:wsx={wind}>
    {#if label}
        <span ws-x="[$label-text]">{label}</span>
    {/if}
    <select value={indexValue} on:input={update} {disabled}>
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
