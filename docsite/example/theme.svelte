<script>
    import { Select, Paper, Button, wsx } from "@axel669/zephyr"

    let theme = $state("dark")

    const options = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Tron", value: "tron" },
    ]
</script>

<Select {options} bind:value={theme} label="Theme" color="@primary" />
<div use:wsx={{ "@@theme": theme }}>
    <Paper card>
        <div>Some text</div>
        <Button color="@primary" outline>Primary Button</Button>
        <Button color="@secondary" fill>Secondary Button</Button>
    </Paper>
</div>
