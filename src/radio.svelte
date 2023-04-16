<script>
    import asuid from "@labyrinthos/asuid"

    import wsx from "./wsx.mjs"

    import Flex from "./flex.svelte"

    export let options = []
    export let layout = Flex
    export let value

    let valueIndex = options.findIndex(item => item.value === value)
    $: value = options[valueIndex]?.value

    const name = asuid()
</script>

<svelte:component this={layout} {...$$restProps}>
    {#each options as {value, label, ...wind}, index (value)}
        <label use:wsx={{"@toggle": true, ...wind}}>
            <span>{label}</span>
            <input type="radio" bind:group={valueIndex} value={index} {name} />
        </label>
    {/each}
</svelte:component>
