import { mount } from "svelte"
import Main from "./main.svelte"

window.app = mount(
    Main,
    { target: document.body }
)
