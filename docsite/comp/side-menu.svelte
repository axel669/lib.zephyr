<script>
    import {
        Drawer,
        Icon,
        Link,
        Paper,
        Tabs,
        Text,
        Titlebar,

        Flex,
        Grid,

        route,
        trackChanges,

        modalContext,
    } from "#lib"

    import examples from "$examples"
    import { theme } from "#state/theme"

    const { close } = modalContext()

    const routeChanged = trackChanges($route)
    const bg = (id, route) => {
        if (route === `/${id}`) {
            return "@secondary-ripple"
        }
        return null
    }

    const options = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Tron", value: "tron" },
    ]

    $effect(() => {
        if (routeChanged($route) === true) {
            close()
        }
    })
</script>

<Drawer w="200px">
    {#snippet content()}
    <Grid rows="auto 48px 48px auto auto 1fr" p="0px" gap="0px" h="100%"
    scrollable={false}>
        <Titlebar fill color="@primary">
            {#snippet title()}
            <Text title>Zephyr</Text>
            {/snippet}
        </Titlebar>
        <Link href="#" button ground r="0px">
            <Icon name="home-filled" t.sz="20px" />
        </Link>
        <Link href="https://github.com/axel669/lib.zephyr" button ground r="0px" target="_blank">
            <Icon name="brand-github" t.sz="20px" />
        </Link>
        <Paper r="0px">
            {#snippet header()}
            <Titlebar color="@accent">
                {#snippet title()}
                <Text slot="title" title>Theme</Text>
                {/snippet}
            </Titlebar>
            {/snippet}
            <Tabs {options} bind:value={$theme} vertical color="@accent" />
        </Paper>
        <Titlebar color="@secondary">
            {#snippet title()}
            <Text title>Components</Text>
            {/snippet}
        </Titlebar>
        <Flex p="0px" scrollable>
            {#each examples as {id, name}}
                <Link href="#/{id}" button !$color_hover="@secondary"
                bg={bg(id, $route)} ground r="0px">
                    {name}
                </Link>
            {/each}
        </Flex>
    </Grid>
    {/snippet}
</Drawer>
