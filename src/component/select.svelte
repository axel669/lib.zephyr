<script>
    let {
        value = $bindable(null),
        ws,
        options,
        children,
        ...rest
    } = $props()

    const update = (evt) => {
        value = evt.target.value
    }
</script>

{#snippet optionList(options)}
    {#each options as opt (opt)}
        {#if opt.group !== undefined}
            <ws-optgroup label={opt.group}>
                {@render optionList(opt.items)}
            </ws-optgroup>
        {:else}
            <ws-option value={opt.value}>{opt.label}</ws-option>
        {/if}
    {/each}
{/snippet}

<ws-select data-ws={ws} onchange={update} {...rest} {value}>
    {#if Array.isArray(options) === true}
        {@render optionList(options)}
    {:else}
        {@render children?.()}
    {/if}
</ws-select>
