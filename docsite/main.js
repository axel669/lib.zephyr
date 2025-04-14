import { mount } from "svelte"
import App from "./app.svelte"

window.app = mount(App, { target: document.body })
