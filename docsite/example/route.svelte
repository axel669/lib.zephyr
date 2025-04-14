<script>
    import { Route, Link, Flex, Text, relpath } from "@axel669/zephyr"
</script>

<Flex>
    <Link href={relpath("/demo")}>
        More content?
    </Link>
    <Route path="/demo">
        <Text>
            more content!
        </Text>
        <Route path="/" exact>
            <Text>
                This only appears if the path params don't
            </Text>
        </Route>
        <Link href={relpath("woah")}>
            Deeper, Path param = woah
        </Link>
        <Link href={relpath("huzzah.message!")}>
            Deeper, Path param = huzzah.message!
        </Link>
        <Route path=":deeper">
            {#snippet children(routeInfo)}
            <Text>Path Param: {routeInfo.params.deeper}</Text>
            {/snippet}
        </Route>
    </Route>
    <Route path="/nesting/">
        <Route>
            Always shows
        </Route>
        <Route path="/deep">
            Deeper
        </Route>
    </Route>
    <Route path="/nesting/:thing">
        {#snippet children(routeInfo)}
        <pre>{JSON.stringify(routeInfo, null, 2)}</pre>
        {/snippet}
    </Route>
</Flex>
