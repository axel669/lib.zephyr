import { readable } from "svelte/store"

// export const hash = $state(location.hash.slice(1))
// window.addEventListener(
//     "popstate",
//     () => hashValue = location.hash.slice(1)
// )
// $effect(
//     () => location.hash = hash
// )

export const hash = readable(
    location.hash.slice(1),
    (set) => {
        window.addEventListener(
            "popstate",
            () => set(location.hash.slice(1))
        )
    }
)
hash.set = (value) => {
    location.hash = value
}
