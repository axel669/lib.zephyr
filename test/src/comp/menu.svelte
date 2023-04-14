<script>
    import {
        MenuDrawer,
        Button,
        Titlebar,
        Text,
    } from "@lib"

    export let close
</script>

<MenuDrawer {close}>
    <Titlebar slot="header">
        <Text slot="title" title>Menu?</Text>
    </Titlebar>

    <div slot="content" ws-x="over[auto]">
        {#each Array.from({ length: 100 }) as _, i}
            <div>{i}</div>
        {/each}
    </div>
</MenuDrawer>
