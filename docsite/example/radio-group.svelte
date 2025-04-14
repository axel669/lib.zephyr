<script>
    import { RadioGroup, Grid, Titlebar, Text } from "@axel669/zephyr"

    const options = [
        { label: "Number", value: 1 },
        { label: "Array", value: [], $color: "@secondary" },
        { label: "String", value: "3", "$color": "@warning" },
        { label: "Really any value", value: new Date() },
    ]
    let value = $state(null)
</script>

<pre>Value: {JSON.stringify(value)}</pre>

<Titlebar>
    {#snippet title()}
    <Text title>
        Flex Layout (default)
    </Text>
    {/snippet}
</Titlebar>
<RadioGroup {options} bind:value />

<Titlebar>
    {#snippet title()}
    <Text title>
        Grid Layout Example
    </Text>
    {/snippet}
</Titlebar>
<RadioGroup {options} bind:value layout={Grid} gr.cols="1fr 1fr" />
