<script>
    import { Toaster, Button } from "@axel669/zephyr"

    let toaster = $state([null, null])
    const notify = () => {
        toaster[0].show(
            5000,
            { message: "Toast Message!", icon: "exclamation-triangle" }
        )
        toaster[1].show(
            5000,
            {
                message: "Toast Message!",
                color: "@secondary",
                actionText: "Click!"
            }
        )
    }
</script>

<Toaster bind:this={toaster[0]} position="br" onaction={console.log} />
<Toaster bind:this={toaster[1]} position="tl" onaction={console.log} />
<Button onclick={notify}>
    Show a Notif
</Button>
