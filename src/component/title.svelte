<script module>
    import { writable } from "svelte/store"

    import { stackStore } from "./routing.svelte.js"

    const stack = stackStore()

    const updateTitle = (format, data) => {
        if (format === null || data === stackStore.empty) {
            return
        }

        document.title = format(data)
    }
</script>

<script>
    import { onMount } from "svelte"

    const {
        data = "",
        format = null,
    } = $props()

    stack.push(data)

    $effect(() => updateTitle(format, $stack))
</script>
