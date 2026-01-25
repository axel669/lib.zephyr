<svelte:options runes />
<script>
    import * as ze from "#lib"
    // import * as ze from "#lib"

    // import Docs from "#comp/docs"
    // import SideMenu from "#comp/side-menu"
    // import { theme } from "#state/theme"

    // import README from "#README"

    // import examples from "$examples"

    // const page = ze.stackStore("Home")

    let open = $state(false)

    let theme = $state("tron")

    const test = () => "testing?"
</script>

<!-- <ze.Title format={data => `Zephyr - ${data}`} data="Home" /> -->

<!-- <svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism-twilight.css" rel="stylesheet" />
    <link href="./md-fix.css" rel="stylesheet" />
</svelte:head>
<svelte:body use:ze.wsx={{"@@theme": $theme, "@@app": true}} /> -->
<svelte:body use:ze.wsData={`#theme.${theme}; @base-radius: 0px; ! * { outln: none; }`} />

<ze.Screen ws="@pad-left: 0px;" paperWS="@color: @primary; variant.outline;">
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

    <ze.ControlLabel label="Test">
        <input type="text" />
    </ze.ControlLabel>
    <ze.ControlLabel ws="@color: @info; variant.outline;">
        <input type="text" />
    </ze.ControlLabel>
    <ze.ControlLabel ws="@color: @success; variant.lined;" label="Lined">
        <input type="text" />
    </ze.ControlLabel>

    <ze.Drawer ws="w: min(80vw, 240px);">
        <ze.Paper ws="variant.outline; @color: @info;">
            {#snippet header()}
                <div>header</div>
            {/snippet}
            <div>some text</div>
            <div>some text</div>
        </ze.Paper>
    </ze.Drawer>
</ze.Screen>


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
