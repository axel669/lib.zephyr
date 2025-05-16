<script>
    import * as ze from "@axel669/zephyr"

    let prompt = $state(null)
    let value = $state("")
    const show = ze.handler$(
        async (modal) => {
            const result = await modal.show()
            console.log(result)
            console.log({ value })
        }
    )
</script>

<ze.Modal bind:this={prompt}>
    <ze.Prompt title="Prompt Example" message="Type a value" bind:value />
</ze.Modal>
<ze.Button onclick={show(prompt)} outline color="@primary">
    Prompt Modal
</ze.Button>

<ze.EntryButton onentry={console.log} outline color="@secondary" m!cancelable>
    Using an EntryButton
    {#snippet modal()}
        <ze.Prompt title="Prompt Example" message="Type a value" bind:value initial="prompt" />
    {/snippet}
</ze.EntryButton>

<div>Prompt Value: {JSON.stringify(value)}</div>
