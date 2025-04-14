<script>
    import { AsyncButton } from "@axel669/zephyr"

    const wait = (time) => new Promise(
        resolve => setTimeout(resolve, time)
    )
    const load = async () => {
        console.log("started")
        await wait(2500)
        console.log("done")
    }
</script>

<AsyncButton handler={load} color="@primary" fill>
    Run Async Function
</AsyncButton>

<AsyncButton handler={load} color="@primary" sp!color="@secondary" fill>
    Run Async Function
</AsyncButton>
