<script>
    import wsx from "./wsx.mjs"

    export let label = ""
    export let color = "default"
    export let checked = false
    export let outline = false
    export let value
    export let group = []
    export let checkbox = false
    export let reverse = false

    $: container = {
        "@toggle": true,
        "@outline": outline,
        $color: color,
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
    {#if reverse !== true}
        <span>{label}</span>
    {/if}
    <input type="checkbox" bind:checked use:wsx={input} />
    {#if reverse === true}
        <span>{label}</span>
    {/if}
</label>
