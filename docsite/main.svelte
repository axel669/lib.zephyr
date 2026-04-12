<svelte:options runes />
<script>
    import { fly, fade } from "svelte/transition"
    import * as ze from "@axel669/zephyr"
    import { hash } from "@axel669/zephyr"

    import sidebar from "$sidebar"

    console.log(sidebar)

    let {
        theme = $bindable("tron")
    } = $props()
    // import * as ze from "#lib"

    // import Docs from "#comp/docs"
    // import SideMenu from "#comp/side-menu"
    // import { theme } from "#state/theme"

    // import README from "#README"

    // import examples from "$examples"

    // const page = ze.stackStore("Home")

    let open = $state(false)
    $effect(() => ($hash, open = false))

    const test = () => "testing?"
    const toasty = () => ze.showToast({
        pos: "top-center",
        message: `Clicked: ${new Date().toLocaleDateString()}`,
        ws: "r: 8px;",
        // snippet: toastin,
    })
    const dia = async () => {
        const result = await ze.showDialog({
            dialog: dialogin,
            message: "Testing!",
            persistent: true,
            color: "@accent",
        })
        console.log("result", result)
        return "dialog hit"
    }
    const wait =  (time) => new Promise(
        resolve => setTimeout(resolve, time)
    )

    const tableData = Array.from(
        { length: 80 },
        (_, i) => ({
            Name: `Item ${i}`,
            Mod: i % 3,
            Power: Math.log2(i)
        })
    )

    const flattenRoutes = (list) => list.map(
        item => [item, flattenRoutes(item.children ?? [])]
    ).flat(Number.POSITIVE_INFINITY)
    const flatRoutes = flattenRoutes(sidebar)
</script>

<!-- <ze.Title format={data => `Zephyr - ${data}`} data="Home" /> -->

{#snippet toastin(opts)}
    <div transition:fly={{ x: "-100%" }}>
        <ze.Toast ws="@color: @accent; @base-radius: 4px;">
            <ze.Text notif>
                {opts.message}
            </ze.Text>
        </ze.Toast>
    </div>
{/snippet}
{#snippet dialogin(opts)}
    <ze.Prompt {...opts} />
{/snippet}

{#snippet testing(args)}
    <pre>{JSON.stringify(args, null, 4)}</pre>
{/snippet}
<ze.Screen ws="@pad-left: 0px;"
paperWS="@color: @primary; variant.outline;"
>
    {#snippet header()}
        <ze.Titlebar ws="variant.fill;">
            <ze.Text title>
                Zephyr Docs
            </ze.Text>

            {#snippet action()}
                <ze.Select ws="@color: @accent;" bind:value={theme}>
                    <ws-option value="light">
                        <ze.Icon name="sun" />
                    </ws-option>
                    <ws-option value="dark">
                        <ze.Icon name="moon" />
                    </ws-option>
                    <ws-option value="tron">
                        <ze.Icon name="hexagon-3d" />
                    </ws-option>
                </ze.Select>
            {/snippet}

            {#snippet menu()}
                <ze.Button onclick={() => open = true}>
                    <ze.Icon name="menu-2" />
                </ze.Button>
            {/snippet}
        </ze.Titlebar>
    {/snippet}

    {#each flatRoutes as route}
        {#if route.url !== undefined}
            <ze.Route path={route.url} exact>
                <!-- <div>
                    {@html route.content}
                </div> -->
                {#if route.example}
                    <div>
                        <route.example />
                    </div>
                {/if}
            </ze.Route>
        {/if}
    {/each}

    <!-- <ze.DataTable data={tableData} rowSize={40}>
        {#snippet header()}
            <tr>
                <th>A</th>
                <th>B</th>
                <th>C</th>
            </tr>
        {/snippet}

        {#snippet row(item)}
            <tr>
                <td>{item.Name}</td>
                <td>{item.Mod}</td>
                <td>{item.Power}</td>
            </tr>
        {/snippet}
    </ze.DataTable> -->

    <ze.Drawer ws="w: min(80vw, 280px);" bind:open>
        <ze.Paper ws="variant.outline; @color: @info;">
            {#snippet header()}
                <ze.Text title>Components</ze.Text>
            {/snippet}
            {@render sidebarItems(sidebar)}
        </ze.Paper>
    </ze.Drawer>
</ze.Screen>

{#snippet sidebarItems(items)}
    {#each items as item}
        {#if item.url}
            <ze.Link button href="#{item.url}" ws="fl.main: start;">
                {item.label}
            </ze.Link>
        {:else}
            <ze.Details label={item.label} ws="@color: @accent;">
                <ze.Flex>
                    {@render sidebarItems(item.children)}
                </ze.Flex>
            </ze.Details>
        {/if}
    {/each}
{/snippet}


<!-- <ze.Screen alignLeft width="100%">
    <ze.Paper square l!p="0px">
        {#snippet header()}
        <ze.Titlebar fill color="@primary">
            {#snippet title()}
            <ze.Text title>
                Zephyr Docs - {$page}
            </ze.Text>
            {/snippet}

            {#snippet menu()}
            <ze.EntryButton ground w!props={{animTime: "100ms"}} m!cancelable>
                <ze.Icon name="menu-2" />
                {#snippet modal()}
                <SideMenu />
                {/snippet}
            </ze.EntryButton>
            {/snippet}
        </ze.Titlebar>
        {/snippet}

        <ze.Flex w="min(100%, 720px)">
            <ze.Route exact path="/">
                <ze.Text>
                    {@html README}
                </ze.Text>
            </ze.Route>
            {#each examples as example}
                <ze.Route path={example.id} component={Docs} props={{...example, page}} />
            {/each}
        </ze.Flex>
    </ze.Paper>
</ze.Screen> -->
