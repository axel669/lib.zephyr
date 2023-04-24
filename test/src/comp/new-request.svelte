<script>
    import {
        Button,
        Icon,
        Paper,
        Screen,
        Text,
        Titlebar,
    } from "@axel669/svelte-wind"

    export let close
</script>

<Screen width="min(1280px, 100%)">
    <Paper scrollable square>
        <Titlebar slot="header" fill color="primary">
            <Text slot="title" title>New Request</Text>

            <Button slot="action" on:click={close} color={false} compact>
                <Icon name="x" />
            </Button>
        </Titlebar>
        {#each Array.from({ length: 100 }) as _, i}
            <div>{i}</div>
        {/each}
    </Paper>
</Screen>
