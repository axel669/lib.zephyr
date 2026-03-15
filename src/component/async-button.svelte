<script>
    import Button from "./button.svelte"
    import CircleSpinner from "./circle-spinner.svelte"

    const {
        onclick,
        onresolve,
        hideSpinner = false,
        children,
        disabled,
        spinnerWS = "",
        ...props
    } = $props()

    let waiting = $state(false)
    const handler = async (e) => {
        waiting = true
        const value = await onclick?.(e)
        waiting = false
        onresolve?.(value)
    }
    const dis = $derived(
        disabled === true
        || waiting === true
    )
</script>

<Button {...props} onclick={handler} disabled={dis}>
    {@render children?.()}
    {#if waiting === true && hideSpinner === false}
        <CircleSpinner ws="@size: 16px; {spinnerWS}" />
    {/if}
</Button>
