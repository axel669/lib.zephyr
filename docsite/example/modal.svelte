<script>
    import * as ze from "@axel669/zephyr"

    let alert = $state(null)
    let confirm = $state(null)
    let prompt = $state(null)
    let value = $state("")
    const show = ze.handler$(
        async (modal) => {
            const result = await modal.show()
            console.log(result)
            if (modal !== prompt || result !== true) {
                return
            }
            console.log({ value })
        }
    )
</script>

<ze.Modal bind:this={alert}>
    <ze.Alert title="Alert Example" message="This is an alert" />
</ze.Modal>
<ze.Modal bind:this={confirm} cancelable>
    <ze.Confirm title="Confirm Example" message="This is a confirmation (cancelable)" />
</ze.Modal>
<ze.Modal bind:this={prompt}>
    <ze.Prompt title="Prompt Example" message="Type a value" bind:value />
</ze.Modal>

<ze.Button onclick={show(alert)} outline color="@primary">
    Alert Modal
</ze.Button>
<ze.Button onclick={show(confirm)} outline color="@secondary">
    Confirm Modal (Cancelable)
</ze.Button>
<ze.Button onclick={show(prompt)} outline color="@accent">
    Prompt Modal
</ze.Button>
<div>Prompt Value: {JSON.stringify(value)}</div>
