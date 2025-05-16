<script>
    import { EntryButton } from "@axel669/zephyr"
    import Drawer from "./drawer/custom.svelte"
</script>

<EntryButton m!cancelable outline>
    Open Menu Drawer
    {#snippet modal()}
        <Drawer />
    {/snippet}
</EntryButton>
<EntryButton m!cancelable outline>
    Open Action Drawer
    {#snippet modal()}
        <Drawer type="action" />
    {/snippet}
</EntryButton>
<EntryButton m!cancelable outline>
    Open Select Drawer
    {#snippet modal()}
        <Drawer type="select" />
    {/snippet}
</EntryButton>
