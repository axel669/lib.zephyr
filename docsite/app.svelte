<script>
    // import {
    //     EntryButton,
    //     Icon,
    //     Link,
    //     Paper,
    //     Screen,
    //     Select,
    //     Text,
    //     Titlebar,

    //     Flex,
    //     Grid,

    //     Route,
    //     Title,

    //     wsx,
    //     stackStore,
    // } from "#lib"
    import * as ze from "#lib"

    import Docs from "#comp/docs"
    import SideMenu from "#comp/side-menu"
    import { theme } from "#state/theme"

    import examples from "$examples"

    const page = ze.stackStore("Home")

    const options = [
        { label: "Theme: Light", value: "light" },
        { label: "Theme: Dark", value: "dark" },
        { label: "Theme: Tron", value: "tron" },
    ]
</script>

<ze.Title format={data => `Zephyr - ${data}`} data="Home" />

<svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism-twilight.css" rel="stylesheet" />
    <link href="./md-fix.css" rel="stylesheet" />
</svelte:head>
<svelte:body use:ze.wsx={{"@@theme": $theme, "@@app": true}} />

<ze.Screen alignLeft width="100%">
    <ze.Paper square l!p="0px">
        {#snippet header()}
        <ze.Titlebar fill color="@primary">
            {#snippet title()}
            <ze.Text title>
                Zephyr Docs - {$page}
            </ze.Text>
            {/snippet}

            {#snippet menu()}
            <ze.EntryButton component={SideMenu} ground w!props={{animTime: "100ms"}}>
                <ze.Icon name="menu-2" />
            </ze.EntryButton>
            {/snippet}
        </ze.Titlebar>
        {/snippet}

        <ze.Flex w="min(100%, 720px)">
            <ze.Route exact path="/">
                Home Screen?
            </ze.Route>
            {#each examples as example}
                <ze.Route path={example.id} component={Docs} props={{...example, page}} />
            {/each}
        </ze.Flex>
    </ze.Paper>
</ze.Screen>
