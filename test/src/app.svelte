<svelte:options immutable />

<script>
    import {
        Button,
        EntryButton,
        Icon,
        LoadZone,
        Paper,
        Screen,
        Text,
        Titlebar,
        DataTable,
        Input,
        Link,
        TH,
        Toggle,
        Tabs,

        wsx,
        filters,
        sorts,

        hash,
    } from "#lib"

    import Menu from "./comp/menu.svelte"
    import data2 from "./data.js"

    let theme = "tron"

    // const wait = (time) => new Promise(
    //     resolve => setTimeout(resolve, time)
    // )
    // const loader = async () => {
    //     await wait(2000)
    //     const n = Math.random()
    //     if (n < 0.5) {
    //         throw new Error("sadge")
    //     }
    //     return n
    // }

    // let asyncThing = loader()
    const data = [].concat(data2, data2, data2)

    const options = [
        { label: "First", value: "/games" },
        { label: "Second", value: "/features" },
        { label: "Default", value: "/boobs" },
    ]
    let activeTab = $hash

    window.hash = hash
    $: console.log($hash)

    $: activeTab = $hash
    $: hash.set(activeTab)
</script>

<svelte:head>
    <title>Zephyr</title>
</svelte:head>
<svelte:body use:wsx={{"@theme": theme, "@app": true}} />

<Screen>
    <Paper square card l-pad="12px">
        <Titlebar slot="header" fill color="@primary">
            <Text title slot="title">
                Zephyr
                <Text subtitle>Oh god please work for me and look good</Text>
            </Text>

            <EntryButton component={Menu} slot="menu">
                <Icon name="menu-2" />
            </EntryButton>
        </Titlebar>

        <Tabs {options} bind:value={activeTab} let:tab let:selected>
            <div>
                Active: {selected.toString()}<br />
                {tab.label}
            </div>
        </Tabs>

        <DataTable pageSize={10} color="@primary" {data} scrollable height="320px">
            <svelte:fragment slot="header">
                <TH filter={filters.text("first")}>1st</TH>
                <TH>Second</TH>
                <TH sort={sorts.natural("third")}>III</TH>
                <TH>d.</TH>
            </svelte:fragment>
            <svelte:fragment slot="row" let:row>
                <td>{row.first}</td>
                <td>{row.second}</td>
                <td>{row.third}</td>
                <td>{row.another}</td>
            </svelte:fragment>
            <div slot="action">
                <Button color="@default">Test?</Button>
            </div>
        </DataTable>

        <!-- <Button on:click={() => asyncThing = loader()}>
            Reload Async
        </Button>
        <LoadZone source={asyncThing} let:result>
            <div>
                content
            </div>
            <div>
                {JSON.stringify(result)}
            </div>

            <div slot="error">
                :(
            </div>
        </LoadZone> -->

        <!-- <Link button href="#" color="@primary" fill>Working?</Link>
        <Link button href="#" color="@primary" fill disabled>Working?</Link>

        <Input label="Pls" /> -->
    </Paper>
</Screen>
