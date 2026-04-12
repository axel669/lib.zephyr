<script module>
    import { ws } from "../ws.js"

    ws.component("ze-async-button")`
        disp: inline-grid;
        pos.rel;
    `

    ws.macro("async.button.spinner")`
        @size: 100%;
        pos.abs;
        x: 50%;
        y: 0px;
        tf: translateX(-50%);
        h: 100%;
    `
</script>

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

<ze-async-button>
    <Button {...props} onclick={handler} disabled={dis}>
        {@render children?.()}
    </Button>
    {#if waiting === true && hideSpinner === false}
        <CircleSpinner ws="async.button.spinner; {spinnerWS}" />
    {/if}
</ze-async-button>
