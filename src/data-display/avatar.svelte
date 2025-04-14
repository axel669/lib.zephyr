<script>
    import wsx from "../wsx.js"

    let {
        alt = "",
        image = null,

        text = "",

        color = false,
        ...rest
    } = $props()

    const wind = $derived({
        "$color": color,
        ...rest
    })
</script>

<ws-avatar use:wsx={wind}>
    {#if image !== null}
        <!-- svelte-ignore a11y_missing_attribute -->
        <object data={image} type="image/png">
            {alt}
        </object>
    {:else}
        {text}
    {/if}
</ws-avatar>
