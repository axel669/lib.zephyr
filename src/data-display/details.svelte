<script>
    import wsx from "../wsx.js"
    import { splitProps } from "../props.js"

    let {
        label,
        outline,
        color = "@default",
        open = false,
        children,
        ...rest
    } = $props()

    const props = $derived(
        splitProps(rest, "s!")
    )
    const wind = $derived({
        "$color": color,
        "$outline": outline,
        ...props.rest,
    })
</script>

<details use:wsx={wind} bind:open>
    <summary use:wsx={props["s!"]}>
        {#if typeof label === "string"}
            {label}
        {:else}
            {@render label?.()}
        {/if}
    </summary>
    {@render children?.()}
</details>
