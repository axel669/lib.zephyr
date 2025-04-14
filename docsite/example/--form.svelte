<script>
    import { Form } from "@axel669/zephyr"

    const fields = [
        {
            name: "text",
            props: {
                label: "Text"
            },
            value: {
                transform: text => text.toUpperCase(),
                validate: text => text.length > 3
            }
        },
        {
            name: "number",
            props: {
                label: "Number",
                type: "number",
                color: "@primary"
            },
            value: {
                out: text => parseFloat(text),
                validate: num => (num > -100 && num < 100)
            }
        }
    ]
    let values = {}
    let valid = {}

    $: output = { values, valid }
</script>

<pre ws-x="[m 0px]">{JSON.stringify(output, null, 2)}</pre>
<Form {fields} bind:values bind:valid />
