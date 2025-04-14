<script>
    import wsx from "../wsx.js"

    const {
        color,
        children,
        start,
        end,
        onclick,
        ...rest
    } = $props()

    const wind = $derived({
        "$color": color,
        ...rest,
    })
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<ws-toast use:wsx={wind} {onclick} role="button">
    {#if start}
        <div ws-x="[$start] [grid]">
            {@render start()}
        </div>
    {/if}
    <div ws-x="[$notif-text]">
        {@render children?.()}
    </div>
    {#if end}
        <div ws-x="[$end] [grid]">
            {@render end()}
        </div>
    {/if}
</ws-toast>
