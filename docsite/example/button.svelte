<script>
    import { Button, Grid } from "@axel669/zephyr"

    const colors = [
        ["Default", "@default"],
        ["Primary", "@primary"],
        ["Secondary", "@secondary"],
        ["Accent", "@accent"],
        ["Warning", "@warning"],
        ["Danger", "@danger"],
    ]
</script>

<Button onclick={() => alert("clicked!")}>
    JS Alert!
</Button>
<Button color="@primary" outline onclick={console.log}>
    Console Log
</Button>

<h3>Button Variants</h3>
<Grid cols="1fr 1fr 1fr">
    {#each colors as [name, color]}
        <Button {color} flat>{name}</Button>
        <Button {color} outline>{name}</Button>
        <Button {color} fill>{name}</Button>

        <Button {color} ground flat>{name}</Button>
        <Button {color} ground outline>{name}</Button>
        <Button {color} ground fill>{name}</Button>
    {/each}
</Grid>
