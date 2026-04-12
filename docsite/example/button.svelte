<script>
    import { Button, Grid } from "@axel669/zephyr"

    const colors = [
        ["Primary", "@primary"],
        ["Success", "@success"],
        ["Accent", "@accent"],
        ["Info", "@info"],
        ["Warning", "@warning"],
        ["Error", "@error"],
    ]
</script>

<Button onclick={() => alert("clicked!")}>
    JS Alert!
</Button>
<Button ws="@color: @primary;" onclick={console.log}>
    Console Log
</Button>

<h3>Button Variants</h3>
<Grid ws="gr.cols: 1fr 1fr 1fr;">
    {#each colors as [name, color]}
        <Button ws="@color: {color};">{name}</Button>
        <Button ws="@color: {color}; variant.outline;">{name}</Button>
        <Button ws="@color: {color}; variant.fill;">{name}</Button>

        <Button ws="@color: {color}; elevate;">{name}</Button>
        <Button ws="@color: {color}; elevate; variant.outline;">{name}</Button>
        <Button ws="@color: {color}; elevate; variant.fill;">{name}</Button>
    {/each}
</Grid>
