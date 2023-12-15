<svelte:options immutable />

<script>
    import wsx from "../wsx.mjs"
    import { handler$ } from "../handler$.mjs"

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
        "$solid": solid,
        "$color": color,
        $vert: vertical,
        ...$$restProps,
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ws-tabs use:wsx={wind} role="tablist">
    {#each options as tab, i}
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <ws-tab use:wsx={{"$tab-selected": index === i}}
        on:click={set(tab.value)} role="tab">
            {tab.label}
        </ws-tab>
    {/each}
</ws-tabs>
