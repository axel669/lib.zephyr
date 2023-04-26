<script>
    import {
        Avatar,
        Badge,
        Button,
        Chip,
        Icon,
        InlineDialog,
        Input,
        Link,
        Modal,
        Notification,
        Paper,
        Popover,
        Progress,
        Radio,
        Screen,
        Select,
        Table,
        Tabs,
        Text,
        Titlebar,
        Toaster,
        Toggle,
        Tooltip,

        DataTable,
        EntryButton,
        Toast,

        Flex,
        Grid,

        wsx,
        handler$,
    } from "@axel669/svelte-wind"

    import TestDialog from "./comp/test-dialog.svelte"
    import TestScreen from "./comp/test-screen.svelte"
    import Menu from "./comp/menu.svelte"

    import NewRequest from "./comp/new-request.svelte"

    // const reverse = {
    //     dark: "tron",
    //     tron: "dark"
    // }
    let theme = "tron"
    // const toggle = () => theme = reverse[theme]

    let clicks = 0
    const inc = () => clicks += 1

    let bind = {}

    const openDialog = async () => {
        console.log(
            await bind.dialog.show()
        )
    }

    const openSubscreen = async () => {
        console.log(
            await bind.subscreen.show()
        )
    }

    const notify = handler$(
        () => bind.notify.show(
            50000,
            {
                message: `Test? ${Math.random()}`,
                icon: "info-hexagon",
                color: "secondary",
                actionText: "Sure",
            }
        )
    )

    const action = (evt) => {
        console.log(evt.detail)
    }

    $: console.log(bind)

    const options = [
        { label: "1st", value: { a: 1 } },
        { label: "2nd", value: { a: 2 }, $color: "primary" },
        { label: "3rd", value: { a: 3 } },
    ]
    let radio = options[0].value
    // $: console.log(radio)

    const selectOpts = [options[0], { group: "blep" }, options[1], options[2]]
    let select = radio
    // $: console.log(select)

    let tab = radio
    $: console.log(tab)

    const data = [
        Array.from({ length: 4 }, (_, i) => `Cell ${i}`),
        Array.from({ length: 4 }, (_, i) => `Row 2,${i}`),
        Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`),
        Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`),
        Array.from({ length: 4 }, (_, i) => `Cell ${i}`),
        Array.from({ length: 4 }, (_, i) => `Row 2,${i}`),
        Array.from({ length: 4 }, (_, i) => `Sq ${i ** 2}`),
        Array.from({ length: 4 }, (_, i) => `Sub ${i - 2}`),
    ]
    const cols = [
        { label: "1st" },
        { label: "second" },
        { label: "Third" },
        { label: "4th" },
    ]
    let page = 0
    $: console.log("page:", page)
</script>

<svelte:head>
    <title>Zephyr</title>
</svelte:head>
<svelte:body use:wsx={{theme, "@app": true}} />

<Screen>
    <Paper square card lprops={{cross: "stretch"}}>
        <Titlebar slot="header" fill color="primary">
            <Flex slot="title">
                <Text title>Zephyr</Text>
                <Text subtitle>Oh god please work for me and look good</Text>
            </Flex>
        </Titlebar>

        <Button variant="outline" color="accent">
            Blep
        </Button>

        <Link color="primary" href="#">
            Test
        </Link>

        <EntryButton component={TestScreen} on:entry={console.log}>
            Test Dialog
        </EntryButton>

        <EntryButton component={Menu} on:entry={console.log}>
            Test Menu
        </EntryButton>
        <EntryButton component={TestDialog} on:entry={console.log}>
            Test Dialog
        </EntryButton>

        <Popover let:show let:hide>
            <Button on:click={show}>
                Pls
            </Button>
            <div ws-x="inset-x[0px] y[0px] h[100px] bg[teal]" slot="content">
                <Button on:click={hide}>
                    Close
                </Button>
            </div>
        </Popover>

        <!-- <EntryButton this={Modal} component={TestDialog} on:entry={console.log}>
            Test Dialog
        </EntryButton>
        <EntryButton this={Modal} component={Menu} on:entry={console.log}>
            Test Menu
        </EntryButton>

        <DataTable {cols} {data} color="warning" pageSize={3} bind:page />
        <Button on:click={() => page = 0}>
            Blep
        </Button>
        <Table {cols} {data} />
        <Table {cols} {data} color="primary" /> -->
    </Paper>
</Screen>
