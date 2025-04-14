<script>
    import { Link, Grid, Text, Titlebar } from "@axel669/zephyr"
</script>

<Titlebar col="span 3">
    {#snippet title()}
    <Text>
        <Text title>Normal Link</Text>
    </Text>
    {/snippet}
</Titlebar>
<Grid cols="1fr 1fr 1fr" gap="8px">
    <Link href="#">Home</Link>
    <Link href="#" color="@primary">Home</Link>
    <Link href="#" color="@secondary">Home</Link>
    <Link href="#" color="@accent">Home</Link>
    <Link href="#" color="@warning">Home</Link>
    <Link href="#" color="@danger">Home</Link>
</Grid>
<Grid cols="1fr 1fr 1fr" gap="8px">
    <Titlebar col="span 3">
        {#snippet title()}
        <Text>
            <Text title>Button Link</Text>
            <Text subtitle>with _blank target</Text>
        </Text>
        {/snippet}
    </Titlebar>

    <Link href="#" target="_blank" button fill>Home</Link>
    <Link href="#" target="_blank" button fill color="@primary">Home</Link>
    <Link href="#" target="_blank" button fill color="@secondary">Home</Link>
    <Link href="#" target="_blank" button fill color="@accent">Home</Link>
    <Link href="#" target="_blank" button fill color="@warning">Home</Link>
    <Link href="#" target="_blank" button fill color="@danger">Home</Link>
</Grid>
