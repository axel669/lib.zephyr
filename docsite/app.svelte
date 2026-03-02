<svelte:options runes />
<script>
    import { fade } from "svelte/transition"
    import * as ze from "#lib"

    import Main from "./main.svelte"
    // import * as ze from "#lib"

    // import Docs from "#comp/docs"
    // import SideMenu from "#comp/side-menu"
    // import { theme } from "#state/theme"

    // import README from "#README"

    // import examples from "$examples"

    // const page = ze.stackStore("Home")

    let open = $state(false)

    let theme = $state("tron")
</script>

<!-- <ze.Title format={data => `Zephyr - ${data}`} data="Home" /> -->

<ze.Application baseline={"@base-radius: 0px; ! * { outln: none; }"} {theme}>
    <Main bind:theme />
</ze.Application>
