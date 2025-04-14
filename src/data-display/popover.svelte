<script>
    import { fade } from "svelte/transition"
    import wsx from "../wsx.js"

    let {
        visible = $bindable(false),
        content,
        popover,
        ...rest
    } = $props()
    const show = () => visible = true
    const hide = () => visible = false
    const anim = { duration: 250 }

    const wind = $derived({
        $show: true,
        ...rest,
    })
</script>

<ws-popover use:wsx={wind}>
    {@render content?.(show)}
    {#if visible}
        <wind-content ws-x="[$content] [inset 0px]" transition:fade={anim}>
            {@render popover?.(hide)}
        </wind-content>
    {/if}
</ws-popover>
