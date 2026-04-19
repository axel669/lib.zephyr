<script>
    import { Suspend, Button, Grid } from "@axel669/zephyr"

    import PretendSync from "./suspend/pretend-sync.svelte"

    let asyncOp = $state(null)
    let failedOp = $state(null)
    const wait = (time) => new Promise(
        (resolve) => setTimeout(resolve, time)
    )
    const asyncTask = async () => {
        await wait(2000)
        return Date.now()
    }
    const failedTask = () => Promise.reject(new Error("Example Error"))

    const runTasks = () => {
        asyncOp = asyncTask()
        failedOp = failedTask()
    }
</script>

<Button ws="variant.fill;" onclick={runTasks}>
    Run Async Task
</Button>
<Grid ws="h: 100px; gr.cols: 1fr 1fr;">
    {#if asyncOp !== null}
        <Suspend time={asyncOp}>
            {#snippet snippet(props)}
                <div>
                    Current Time: {new Date(props.time).toLocaleString()}
                </div>
            {/snippet}
        </Suspend>
        <Suspend component={PretendSync} time={asyncOp} other={failedOp}>
            {#snippet error(err)}
                <div>
                    Error: {err.message}
                </div>
            {/snippet}
        </Suspend>
    {/if}
</Grid>
