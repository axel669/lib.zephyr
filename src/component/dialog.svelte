<script module>
    import { fade } from "svelte/transition"

    import DialogElement from "./dialog-element.svelte"
    let stack = $state([])

    const defTs = {
        duration: 250,
        func: fade
    }

    export const showDialog = (options) => new Promise(
        (resolve) => {
            const {
                dialog = null,
                transition = defTs,
                transitionIn = transition,
                transitionOut = transition,
                ...opts
            } = options
            if (dialog === null) {
                return false
            }

            const id = `${Math.random()}:${Date.now()}`
            const close = (value) => {
                stack = stack.filter(
                    (dia) => dia[2] !== id
                )
                resolve(value)
            }
            stack.push([
                dialog,
                { ...opts, tIn: transitionIn, tOut: transitionOut, close },
                id
            ])
        }
    )
</script>

{#each stack as [dialog, options, id] (id)}
    <DialogElement {options} {dialog} />
{/each}
