<script>
    import {
        // ActionDrawer,
        // MenuDrawer,
        // SelectDrawer,
        Button,
        Drawer,
        Titlebar,
        Text,
    } from "@lib"

    export let close
</script>

<Drawer type="select" {close} height="250px">
    <Titlebar slot="header">
        <Text slot="title" title>Menu?</Text>
    </Titlebar>

    <div slot="content" ws-x="over[auto]">
        {#each Array.from({ length: 100 }) as _, i}
            <div>{i}</div>
        {/each}
    </div>
</Drawer>
