<script>
    import { Badge, Button } from "@axel669/zephyr"

    let count = $state(1)
    const inc = () => count += 1
</script>

<Badge text={count}>
    Unread Messages
</Badge>
<Badge text="1k+" ws="@color: @warning;">
    <Button onclick={inc} ws="@color: @success;">Clickable Content</Button>
</Badge>
