import { readable } from "svelte/store"

export const hash = readable(
    location.hash.slice(1),
    (set) => {
        setInterval(
            () => set(location.hash.slice(1)),
            50
        )
    }
)
hash.set = (value) => {
    location.hash = value
}
