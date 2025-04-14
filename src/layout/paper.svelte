<script>
    import Flex from "./flex.svelte"
    import wsx from "../wsx.js"
    import { splitProps } from "../props.js"

    const {
        color,
        card = false,
        square = false,
        layout = Flex,
        scrollable = true,
        children,
        content,
        header,
        footer,
        ...rest
    } = $props()

    const props = $derived(
        splitProps(rest, "l!")
    )

    const layoutProps = $derived({
        over: scrollable ? "auto" : false,
        $content: true,
        ...props["l!"],
    })
    const wind = $derived({
        "$color": color,
        "$outline": card,
        r: square && "0px",
        ...props.rest,
    })
</script>

<ws-paper use:wsx={wind}>
    {#if header}
        <div ws-x="[$header] [grid] [p 0px]">
            {@render header()}
        </div>
    {/if}
    {#if content}
        {@render content()}
    {:else}
        <Flex {...layoutProps}>
            {@render children?.()}
        </Flex>
    {/if}
    {#if footer}
        <div ws-x="[$footer] [grid] [p 0px]">
            {@render footer()}
        </div>
    {/if}
</ws-paper>
