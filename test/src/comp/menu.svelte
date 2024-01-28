<script>
    import {
        // ActionDrawer,
        // MenuDrawer,
        // SelectDrawer,
        Button,
        Drawer,
        Titlebar,
        Text,
    } from "@axel669/svelte-wind"

    export let close

    export const cancel = () => close(null)
</script>

<Drawer>
    <Titlebar slot="header">
        <Text slot="title" title>Menu?</Text>
        <Button slot="action" on:click={close}>
            X
        </Button>
    </Titlebar>

    <div slot="content" ws-x="over[auto]">
        {#each Array.from({ length: 100 }) as _, i}
            <div>{i}</div>
        {/each}
    </div>
</Drawer>
