<script>
    import wsx from "../wsx.js"

    let {
        color = "@default",
        checkbox = false,
        checked = $bindable(),
        flat = false,
        group = $bindable(),
        label = "",
        reverse = false,
        value,
        children,
        ...rest
    } = $props()

    const container = $derived({
        "@@toggle": true,
        "$flat": flat,
        "$color": color,
        "fl.dir": reverse ? "row-reverse" : false,
        ...rest,
    })
    const input = $derived({
        "@@switch": checkbox === false
    })

    const updateGroup = (checked) => {
        if (Array.isArray(group) === false) {
            return
        }
        if (checked === true) {
            if (group.includes(value) === true) {
                return
            }
            group.push(value)
            return
        }
        if (group.includes(value) === false) {
            return
        }
        group.splice(group.indexOf(value), 1)
    }
    const get = () => checked
    const set = (next) => {
        checked = next
        updateGroup(next)
    }
</script>

<label use:wsx={container}>
    <div>
        {#if children}
            {@render children()}
        {:else}
            {label}
        {/if}
    </div>
    <input type="checkbox" bind:checked={get,set} use:wsx={input} />
</label>
