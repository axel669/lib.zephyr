<script>
    const { ws, ...rest } = $props()
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<ws-circle-spinner data-ws={ws} {...rest} />
