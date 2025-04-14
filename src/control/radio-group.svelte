<script>
    import wsx from "../wsx.js"
    import { handler$ } from "../handler$.js"

    import Flex from "../layout/flex.svelte"

    let {
        layout = Flex,
        options = [],
        value = $bindable(),
        ...rest
    } = $props()

    const Layout = $derived(layout)
</script>

<Layout {...rest}>
    {#each options as {value: itemValue, label, disabled, ...wind}, index (itemValue)}
        <label use:wsx={{"@@toggle": true, ...wind}} {disabled}>
            <span>{label}</span>
            <input type="radio" value={itemValue} bind:group={value} />
        </label>
    {/each}
</Layout>
