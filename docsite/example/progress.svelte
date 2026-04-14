<script>
    import { Progress, Flex, Text } from "@axel669/zephyr"
</script>

<Flex>
    <Text title>Basic Progress Bar</Text>
    <Progress value="0.3" />
    <Progress value="0.7" />

    <Text title>Colorized Progress Bar</Text>
    <Progress value="0.3" ws="@color: @primary;" />
    <Progress value="0.7" ws="@color: @success;" />

    <Text title>Interdemindate (busy) Progress Bar</Text>
    <Progress busy />
    <Progress busy ws="@color: @primary;" />
    <Progress busy ws="@color: @accent;" />

    <Text title>Buffered Progress Bar</Text>
    <Progress value="0.3" buffer="0.5" />
    <Progress value="0.7" buffer="0.9" ws="@color: @error;" r="0px" />
</Flex>
