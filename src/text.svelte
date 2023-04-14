<script>
    import wsx from "./wsx.mjs"

    export let title = false
    export let subtitle = false
    export let block = false
    export let adorn = false

    $: wind = {
        "$title-text": title,
        "$subtitle": subtitle,
        "$adorn": adorn,
        block,
        ...$$restProps
    }
</script>

<span use:wsx={wind}>
    <slot />
</span>
