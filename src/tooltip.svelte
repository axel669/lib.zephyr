<script>
    /*md
    [@] Components/Data Display/Tooltip

    # Tooltip

    Displays a tooltip above (or below) some content when it's hovered.
    */

    import wsx from "./wsx.mjs"

    export let text = ""
    export let bottom = false

    $: wind = {
        $bottom: bottom,
        ...$$restProps,
    }
</script>

<ws-tooltip ws-text={text} use:wsx={wind}>
    <slot />
</ws-tooltip>
