<script>
    import Button from "../control/button.svelte"
    import Spinner from "../spinner/circle-spinner.svelte"
    import { splitProps } from "../props.js"

    const {
        handler = null,
        disabled,
        ...rest
    } = $props()

    let running = $state(false)
    const onclick = async (evt) => {
        running = true
        await handler(evt)
        running = false
    }

    const inactive = $derived(disabled || running)
    const prop = $derived(
        splitProps(rest, "sp!")
    )
    const buttonProps = $derived({
        ...prop.rest,
        disabled: inactive,
    })
</script>

<async-button ws-x="[disp inline-grid] [gr.cols 1fr] [pos relative]">
    <Button {...buttonProps} {onclick} />
    {#if running === true}
        <Spinner
            size="unset"
            pos="absolute"
            x="50%" y="0px"
            tf="translateX(-50%)"
            h="100%"
            {...prop["sp!"]}
        />
    {/if}
</async-button>
