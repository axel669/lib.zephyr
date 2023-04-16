<script>
    import wsx from "./wsx.mjs"

    export let value = 0
    export let max = 1
    export let color = "default"
    export let outline = false
    export let row = false
    export let label = null

    $: wind = {
        "@progress": true,
        "@outline": outline,
        $color: color,
        $row: row,
        ...$$restProps,
    }
</script>

<label use:wsx={wind}>
    {#if label}
        <span ws-x="$text t-ws[nowrap]">{label}</span>
    {/if}
    <progress {value} {max} />
</label>
