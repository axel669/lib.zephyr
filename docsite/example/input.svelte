<script>
    import { Input, Button, Grid } from "@axel669/zephyr"

    let values = $state({
        "color": "",
        "file": "",
        "number": "",
        "email": "",
        "text": "",
        "password": "",
        "search": "",
        "tel": "",
        "date": "",
        "datetime-local": "",
        "time": "",
        "month": "",
        "week": "",
    })
    let areaValue = $state("")

    const colors = [
        "@primary",
        "@secondary",
        "@accent",
        "@warning",
        "@danger",
    ]

    const formatLabel = (type) =>
        `${type.replace(/^\w/g, s => s.toUpperCase()).replace()}`
</script>

<Grid cols="1fr 1fr" p="0px">
    {#each Object.keys(values) as type}
        <Input bind:value={values[type]} {type} label={formatLabel(type)} />
    {/each}
    <Input type="area" bind:value={areaValue} label="Area" col="span 2" />
</Grid>

<div>
    <pre>{JSON.stringify({ ...values, areaValue }, null, 4)}</pre>
</div>

<Grid cols="1fr 1fr 1fr" p="0px">
    {#each colors as color}
        <Input {color} label={color} />
        <Input outline {color} label="outline" />
        <Input linedFill {color} label="linedFill" />
        <Input lined {color} label="lined" />
        <Input flat {color} label="flat" />
        <Input disabled {color} label="disabled" />
    {/each}
</Grid>
