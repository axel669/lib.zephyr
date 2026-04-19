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
    const flatRoutes = flattenRoutes(sidebar.items)
    const titles = flatRoutes.reduce(
        (map, route) => {
            if (route.url === undefined) {
                return map
            }
            map[route.url] = route.label
            return map
        },
        { "": "Home" }
    )
    let pageLabel = $state("")
    $effect(() => {
        pageLabel = titles[$hash]
    })
</script>

<svelte:head>
    <title>Zephyr Docs - {pageLabel}</title>
</svelte:head>

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
layoutWS="over: auto;"
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
                <div>
                    {@html route.content}
                </div>
                {#if route.example}
                    <h2>Example</h2>
                    <div>
                        <ze.Link
                        button
                        href="{sidebar.config.links.github}{route.exampleFile}"
                        target="_blank"
                        ws="variant.outline; @color: @info;"
                        >
                            <ze.Icon name="brand-github" />
                            {@html "&nbsp;"}
                            Example Source
                        </ze.Link>
                    </div>
                    <div>
                        <route.example />
                    </div>
                {/if}
            </ze.Route>
        {/if}
    {/each}

    <ze.Drawer ws="w: min(80vw, 280px);" bind:open>
        <ze.Paper ws="variant.outline; @color: @info;" layoutWS="over: auto;">
            {#snippet header()}
                <ze.Text title>Components</ze.Text>
            {/snippet}
            {@render sidebarItems(sidebar.items)}
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
