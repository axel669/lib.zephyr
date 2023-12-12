<script>
    import wsx from "../wsx.mjs"
    import { handler$ } from "../handler$.mjs"

    import Flex from "../layout/flex.svelte"

    export let options = []
    export let layout = Flex
    export let value

    $: valueIndex = options.findIndex(item => item.value === value)
    const set = handler$(
        (newValue) => value = newValue
    )

    const name = `${Math.random().toString(16)}-${Date.now()}`
</script>

<svelte:component this={layout} {...$$restProps}>
    {#each options as {value, label, disabled, ...wind}, index (value)}
        <label use:wsx={{"$toggle": true, ...wind}} {disabled}>
            <span>{label}</span>
            <input type="radio" on:input={set(value)} {name} checked={index === valueIndex} />
        </label>
    {/each}
</svelte:component>
