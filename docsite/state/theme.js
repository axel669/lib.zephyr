import { writable } from "svelte/store"

export const theme = writable(localStorage.theme ?? "dark")
theme.subscribe(
    theme => localStorage.theme = theme
)
