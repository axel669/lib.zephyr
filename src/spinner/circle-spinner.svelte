<script>
    import wsx from "../wsx.mjs"

    export let size = "100px"
    export let color = "primary"

    $: wind = {
        "&size": size,
        "$color": color,
    }
</script>

<ws-circle-spinner use:wsx={wind} />
