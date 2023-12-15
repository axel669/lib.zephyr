<svelte:options immutable />

<script>
    import { fade } from "svelte/transition"
    import wsx from "../wsx.mjs"

    let visible = false
    const show = () => visible = true
    const hide = () => visible = false
    const anim = { duration: 250 }

    $: wind = {
        $show: true,
        ...$$restProps,
    }
</script>

<ws-popover use:wsx={wind}>
    <slot {show} />
    {#if visible}
        <wind-content slot="content" ws-x="inset[0px]" transition:fade={anim}>
            <slot name="content" {hide} />
        </wind-content>
    {/if}
</ws-popover>
