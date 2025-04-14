<script>
    import { ElementToaster, Button, handler$ } from "@axel669/zephyr"

    const message = handler$(
        show => show(
            5000,
            { message: "Toast Message!", icon: "exclamation-triangle" }
        )
    )
    const warning = handler$(
        show => show(
            5000,
            {
                message: "Toast Message!",
                color: "@warning",
                actionText: "Click!"
            }
        )
    )
</script>

<ElementToaster position="top" onaction={console.log}>
    {#snippet content(show)}
        <Button onclick={message(show)}>
            Show a Message
        </Button>
    {/snippet}
</ElementToaster>
<ElementToaster position="bottom" onaction={console.log} w.min="300px">
    {#snippet content(show)}
        <Button onclick={warning(show)}>
            Show a Warning
        </Button>
    {/snippet}
</ElementToaster>
