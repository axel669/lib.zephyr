<script>
    import asuid from "@labyrinthos/asuid"

    import wsx from "./wsx.mjs"
    import { handler$ } from "./handler$.mjs"

    import Flex from "./flex.svelte"

    export let options = []
    export let layout = Flex
    export let value

    $: valueIndex = options.findIndex(item => item.value === value)
    const set = handler$(
        (newValue) => value = newValue
    )

    const name = asuid()
</script>

<svelte:component this={layout} {...$$restProps}>
    {#each options as {value, label, ...wind}, index (value)}
        <label use:wsx={{"@toggle": true, ...wind}}>
            <span>{label}</span>
            <input type="radio" on:input={set(value)} {name} checked={index === valueIndex} />
        </label>
    {/each}
</svelte:component>
