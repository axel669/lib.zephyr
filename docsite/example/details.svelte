<script>
    import { Details, Icon } from "@axel669/zephyr"

    let open = $state(false)
</script>

<div>Open: {open}</div>
<Details label="Info" bind:open>
    Look, more info could go here!
</Details>

<Details bind:open outline color="@primary">
    {#snippet label()}
    <div>
        Slotted labels allowed! <Icon name="hexagon" />
    </div>
    {/snippet}

    Another one!
</Details>
