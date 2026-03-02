<svelte:options runes />
<script>
    import { fly, fade } from "svelte/transition"
    import * as ze from "#lib"

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
    }
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

    <ze.Button ws="variant.fill;" onclick={toasty}>
        Toast?
    </ze.Button>
    <ze.Button ws="variant.fill;" onclick={dia}>
        Dialog?
    </ze.Button>
    <ze.ControlLabel>
        <input type="text" />
    </ze.ControlLabel>

    <ze.Drawer ws="w: min(80vw, 280px);" bind:open>
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
