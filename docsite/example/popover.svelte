<script>
    import { Popover, Button } from "@axel669/zephyr"
</script>

<Popover>
    {#snippet content(show)}
    <Button onclick={show} outline>
        Show
    </Button>
    {/snippet}

    {#snippet popover(hide)}
    <div ws-x="[inset.x 0px] [y 0px] [h 100px] [bg teal]">
        <Button onclick={hide} outline>
            Hide
        </Button>
    </div>
    {/snippet}
</Popover>
