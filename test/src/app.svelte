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
        Th,
        Toggle,
        Tabs,

        wsx,
        filters,
        sorts,
    } from "#lib"

    import Menu from "./comp/menu.svelte"

    let theme = "tron"

    const wait = (time) => new Promise(
        resolve => setTimeout(resolve, time)
    )
    const loader = async () => {
        await wait(2000)
        const n = Math.random()
        if (n < 0.5) {
            throw new Error("sadge")
        }
        return n
    }

    let asyncThing = loader()

    // const dx = (a) => ({
    //     first: a[0],
    //     second: a[1],
    //     third: a[2],
    //     another: a[3],
    // })
    // const data = [
    //     dx(Array.from({ length: 4 }, (_, i) => `Cell ${i}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Row 2,${i}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Cell ${i}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Row 2,${i}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`)),
    //     dx(Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`)),
    // ]
    // console.log(JSON.stringify(data, null, 4))
    const data2 = [
        {
            "first": "Cell 0",
            "second": "Cell 1",
            "third": "Cell 2",
            "another": "Cell 3"
        },
        {
            "first": "Row 2,0",
            "second": "Row 2,1",
            "third": "Row 2,2",
            "another": "Row 2,3"
        },
        {
            "first": "Sq 0",
            "second": "Sq 1",
            "third": "Sq 4",
            "another": "Sq 9"
        },
        {
            "first": "Sub -2",
            "second": "Sub -1",
            "third": "Sub 0",
            "another": "Sub 1"
        },
        {
            "first": "Cell 0",
            "second": "Cell 1",
            "third": "Cell 2",
            "another": "Cell 3"
        },
        {
            "first": "Row 2,0",
            "second": "Row 2,1",
            "third": "Row 2,2",
            "another": "Row 2,3"
        },
        {
            "first": "Sq 0",
            "second": "Sq 1",
            "third": "Sq 4",
            "another": "Sq 9"
        },
        {
            "first": "Sub -2",
            "second": "Sub -1",
            "third": "Sub 0",
            "another": "Sub 1"
        }
    ]
    const data = [].concat(data2, data2, data2)

    const options = [
        { label: "First", value: 1 },
        { label: "Second", value: 2 },
        { label: "Default", value: null },
    ]
    let activeTab = 1
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

        <DataTable pageSize={10} color="@primary" {data} scrollable height="320px">
            <svelte:fragment slot="header">
                <Th filter={filters.text("first")}>1st</Th>
                <Th>Second</Th>
                <Th sort={sorts.natural("third")}>III</Th>
                <Th>d.</Th>
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
        <DataTable pageSize={10} color="@primary" {data}>
            <svelte:fragment slot="header">
                <Th filter={filters.text("first")}>1st</Th>
                <Th>Second</Th>
                <Th sort={sorts.natural("third")}>III</Th>
                <Th>d.</Th>
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

        <Button on:click={() => asyncThing = loader()}>
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
        </LoadZone>

        <!-- <Link button href="#" color="@primary" fill>Working?</Link>
        <Link button href="#" color="@primary" fill disabled>Working?</Link>

        <Input label="Pls" /> -->
    </Paper>
</Screen>
