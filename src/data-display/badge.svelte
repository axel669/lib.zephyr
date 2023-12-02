<script>
    import wsx from "../wsx.mjs"

    export let color = "default"
    export let text = ""

    $: wind = { "$color": color, ...$$restProps }
</script>

<ws-badge ws-text={text} use:wsx={wind}>
    <slot />
</ws-badge>
