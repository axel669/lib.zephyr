<script>
    import { writable } from "svelte/store"

    import wsx from "../wsx.js"
    import { handler$ } from "../handler$.js"
    import { splitProps } from "../props.js"

    let {
        color = "@default",
        fill = false,
        options = [],
        value = $bindable(),
        vertical = false,
        ...rest
    } = $props()

    const props = $derived(
        splitProps(rest, "t!")
    )
    const wind = $derived({
        "$fill": fill,
        "$color": color,
        $vert: vertical,
        ...props.rest,
    })
</script>

<ws-tabs use:wsx={wind} role="tablist">
    {#each options as tab, i}
        <label>
            <input type="radio" value={tab.value} bind:group={value} />
            <ws-tab use:wsx={props["t!"]}>{tab.label}</ws-tab>
        </label>
    {/each}
</ws-tabs>
