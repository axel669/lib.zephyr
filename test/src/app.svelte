<script>
    import {
        Avatar,
        Badge,
        Button,
        Chip,
        Icon,
        InlineDialog,
        Input,
        Modal,
        Paper,
        Screen,
        Text,
        // TextInput,
        Titlebar,

        EntryButton,

        Flex,
        Grid,

        wsx,
        handler$,
    } from "@lib"

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

    $: console.log(bind)
</script>

<svelte:head>
    <title>Svelte-Wind</title>
</svelte:head>
<svelte:body use:wsx={{theme, "@app": true}} />

<Screen>
    <Paper square card lprops={{cross: "stretch"}}>
        <Titlebar slot="header" fill color="primary">
            <Flex slot="title">
                <Text title>Svelte Wind</Text>
                <Text subtitle>Oh god please work for me and look good</Text>
            </Flex>
        </Titlebar>

        <EntryButton this={Modal} component={TestDialog} on:entry={console.log}>
            Show Dialog
        </EntryButton>
        <EntryButton this={Modal} component={Menu} on:entry={console.log}>
            Show Menu
        </EntryButton>
    </Paper>
</Screen>
