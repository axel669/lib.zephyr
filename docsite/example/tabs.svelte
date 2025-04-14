<script>
    import { Tabs } from "@axel669/zephyr"

    const options = [
        { label: "Left", value: "left" },
        { label: "Right", value: 2 },
        { label: "Array", value: ["wat"] },
    ]
    let value = $state("left")
</script>

<pre>Value: {JSON.stringify(value)}</pre>
<Tabs {options} bind:value color="@primary" />
<Tabs {options} bind:value color="@secondary" fill vertical t!b.l.w="4px" />
