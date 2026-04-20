<script>
    import {
        Tooltip,

        Button,
        Flex,
        Text,
    } from "@axel669/zephyr"
</script>

<Flex ws="p.y: 40px; fl.dir: row;">
    <Tooltip pos="top" text="Random stuff">
        <Text>Some Content</Text>
    </Tooltip>

    <Tooltip pos="bottom" text="Save Something" ws="@color: @info;">
        <Button ws="variant.outline;">Save Example</Button>
    </Tooltip>
</Flex>
