<script>
    import Button from "../control/button.svelte"
    import Spinner from "../spinner/circle-spinner.svelte"

    export let handler = null
    export let disabled
    export let inactiveProps = null

    let running = false
    const asyncHandler = async (evt) => {
        running = true
        await handler(evt)
        running = false
    }

    $: inactive = (typeof disabled === "boolean") ? disabled : running
    $: props = {
        ...$$restProps,
        ...(running === false ? null : inactiveProps),
        disabled: inactive,
    }
</script>

<Button {...props} on:click={asyncHandler}>
    <div ws-x="h[20px] m.r:not(:empty)[4px]">
        {#if running === true}
            <Spinner size="20px" />
        {/if}
    </div>
    <slot />
</Button>
