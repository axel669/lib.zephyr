<script>
    import {
        Avatar,
        Badge,
        Button,
        Chip,
        Icon,
        InlineDialog,
        Modal,
        Paper,
        Text,
        Titlebar,

        Flex,
        Grid,

        wsx,
        handler$,
    } from "@lib"

    import TestDialog from "./comp/test-dialog.svelte"

    const reverse = {
        dark: "tron",
        tron: "dark"
    }
    let theme = "tron"
    const toggle = () => theme = reverse[theme]

    let clicks = 0
    const inc = () => clicks += 1

    let dialog = null
    const openDialog = async () => {
        console.log(
            await dialog.show()
        )
    }

    const image = "https://freepngimg.com/save/109659-kingdom-hearts-sora-photos-free-transparent-image-hd/801x816"
</script>

<svelte:body use:wsx={{theme}} />

<div ws-x="h[20px]" />

<Badge text={clicks} color="primary">
    <Icon name="abacus">Things Clicked</Icon>
</Badge>

<Button on:click={openDialog}>
    Please Open Dialog
</Button>
<Paper card>
    <Flex slot="content">
        <div>0</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </Flex>
    <Titlebar slot="header">
        <Flex slot="title">
            <Text title>Testing</Text>
            <Text subtitle>subtitle?</Text>
        </Flex>
    </Titlebar>
</Paper>

<Flex theme="dark">
    <Modal bind:this={dialog} component={TestDialog} />
    <Button variant="outline" color="primary" on:click={toggle}>
        Toggle
    </Button>

    <Avatar text="69" color="secondary" t-sz="18px" />
    <Avatar {image} />

    <Chip color="accent" click on:click={inc}>
        Testing?
    </Chip>

    <InlineDialog let:id>
        <Button slot="toggle" variant="fill" color="warning" for={id} label>
            Dialog?
        </Button>

        <Flex slot="content">
            <Text>Blep</Text>
            <Button variant="fill" color="accent" for={id} label>
                Close
            </Button>
        </Flex>
    </InlineDialog>
</Flex>
<Grid cols={["1fr", "1fr"]} autoRow="50px">
    <Button variant="outline" color="primary" on:click={toggle}>
        Toggle
    </Button>

    <Avatar text="69" color="secondary" t-sz="18px" />
    <Avatar {image} />

    <Chip color="accent" click on:click={inc}>
        Testing?
    </Chip>
</Grid>
