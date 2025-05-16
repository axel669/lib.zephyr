<script>
    import { Alert, Confirm, EntryButton } from "@axel669/zephyr"

    let openTime = $state(null)
</script>

<EntryButton onentry={console.log} outline>
    Show Confirm
    {#snippet modal()}
        <Confirm title="Static Props" message="Insert cool confirmation message here" />
    {/snippet}
</EntryButton>
<EntryButton onentry={console.log} onopen={() => openTime = new Date().toLocaleString()} outline>
    Show Dynamic Alert
    {#snippet modal()}
        <Alert title="Dynamic? Props" message="Opened at {openTime}" />
    {/snippet}
</EntryButton>
