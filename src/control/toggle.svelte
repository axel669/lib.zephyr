<script>
    import wsx from "../wsx.mjs"

    export let label = ""
    export let color = "default"
    export let checked = false
    export let flat = false
    export let value
    export let group = []
    export let checkbox = false
    export let reverse = false

    $: container = {
        "$toggle": true,
        "$flat": flat,
        "$color": color,
        "fl.dir": reverse ? "row-reverse" : false,
        ...$$restProps,
    }
    $: input = {
        "$switch": checkbox === false
    }

    const updateGroup = (checked) => {
        if (checked === true) {
            if (group.includes(value) === true) {
                return
            }
            group = [...group, value]
            return
        }
        if (group.includes(value) === false) {
            return
        }
        group = group.filter(item => item !== value)
    }
    $: updateGroup(checked)
</script>

<label use:wsx={container}>
    <div>
        <slot>
            {label}
        </slot>
    </div>
    <input type="checkbox" bind:checked use:wsx={input} />
</label>
