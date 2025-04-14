<script>
    import wsx from "../wsx.js"

    const {
        color,
        fill = false,
        title,
        menu,
        action,
        ...rest
    } = $props()

    const titleProps = $derived({
        "$color": color,
        "$fill": fill,
        $title: true,
    })
    const wind = $derived({
        ...rest,
    })
</script>

<ws-titlebar use:wsx={wind}>
    {#if title}
        <div use:wsx={titleProps}>
            {@render title()}
        </div>
    {/if}

    {#if menu}
        <div ws-x="[$menu] [grid] [p 0px]">
            {@render menu()}
        </div>
    {/if}
    {#if action}
        <div ws-x="[$action] [grid] [p 0px]">
            {@render action()}
        </div>
    {/if}
</ws-titlebar>
