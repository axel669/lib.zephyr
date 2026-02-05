<script module>
    const stacks = $state({
        "top-left": [],
        "top-center": [],
        "top-right": [],
        "center-right": [],
        "center-left": [],
        "bottom-left": [],
        "bottom-center": [],
        "bottom-right": [],
    })
    const notifs = $derived(
        Object.entries(stacks)
    )

    export const showToast = (options) => {
        const {
            snippet = info,
            pos = "top-center",
            ...opts
        } = options
        const id = `${Math.random()}:${Date.now()}`
        const hide = () => {
            stacks[pos] = stacks[pos].filter(
                (notif) => notif[2] !== id
            )
        }
        stacks[pos].unshift([
            snippet,
            { ...opts, hide },
            id
        ])
        setTimeout(hide, opts.time ?? 5000)
    }
</script>

<script>
    import { fade } from "svelte/transition"

    import Icon from "./icon.svelte"
    import Text from "./text.svelte"
    import Toast from "./toast.svelte"
</script>

{#snippet info(options)}
    <div transition:fade>
        <Toast ws="@color: {options.color ?? "@info"}; {options.ws ?? ""}">
            <Icon name={options.icon ?? "info-hexagon"} />
            <Text notif>{options.message}</Text>
        </Toast>
    </div>
{/snippet}

{#each notifs as [pos, stack] (pos)}
    <ws-toaster {pos}>
        {#each stack as [notif, options, id] (id)}
            {@render notif(options)}
        {/each}
    </ws-toaster>
{/each}
