<script>
    import wsx from "./wsx.mjs"
    import { handler$ } from "./handler$.mjs"

    export let color = "primary"
    export let options = []
    export let vertical = false
    export let solid = false
    export let value

    $: index = options.findIndex(item => item.value === value)

    const set = handler$(
        (next) => {
            if (value === next) {
                return
            }
            value = next
        }
    )

    $: wind = {
        "@solid": solid,
        $color: color,
        $vert: vertical,
        ...$$restProps,
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-tabs use:wsx={wind}>
    {#each options as tab, i}
        <ws-tab tab-selected={index === i || null} on:click={set(tab.value)}>
            {tab.label}
        </ws-tab>
    {/each}
</ws-tabs>
