<script>
    import { Select } from "@axel669/zephyr"

    // Results in:
    // <option>first</option>
    // <optgroup label="Not Numbers">
    //     <option>second</option>
    //     <option>third</option>
    // </optgroup>
    const options = [
        { label: "first", value: 1 },
        { group: "Not numbers" },
        { label: "second", value: "two" },
        { label: "third", value: [3] },
    ]
    let value = $state(1)
</script>

<pre>Value: {JSON.stringify(value)}</pre>
<Select {options} bind:value label="Blep" />
<Select {options} bind:value color="@warning" label="Why" />

<Select {options} flat bind:value label="Blep" />
<Select {options} flat bind:value color="@warning" label="Why" />
