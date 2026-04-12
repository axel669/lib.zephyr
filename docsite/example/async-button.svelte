<script>
    import { AsyncButton } from "@axel669/zephyr"

    const wait = (time) => new Promise(
        resolve => setTimeout(resolve, time)
    )
    const load = async () => {
        console.log("started")
        await wait(2500)
        console.log("done")
        return "return value"
    }
</script>

<AsyncButton onclick={load} onresolve={console.log} ws="@color: @primary; variant.fill;">
    Run Async Function
</AsyncButton>

<AsyncButton onclick={load} onresolve={console.log} ws="@color: @primary;" spinnerWS="@color: @success;">
    Run Async Function
</AsyncButton>
