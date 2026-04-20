<script>
    import { Table, Flex } from "@axel669/zephyr"

    const data = Array.from(
        { length: 10 },
        (_, i) => [i, i ** 2, i ** 3]
    )
</script>

<Flex>
    <Table {data}>
        {#snippet header()}
            <tr>
                <th>N</th>
                <th>Squared</th>
                <th>Cubed</th>
            </tr>
        {/snippet}

        {#snippet row(row)}
            <tr>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
            </tr>
        {/snippet}
    </Table>

    <Table {data} ws="@color: @success;">
        {#snippet header()}
            <tr slot="header">
                <th>N</th>
                <th>Squared</th>
                <th>Cubed</th>
            </tr>
        {/snippet}

        {#snippet row(row)}
            <tr>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
            </tr>
        {/snippet}
    </Table>
</Flex>
