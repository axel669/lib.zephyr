<script>
    const { ws, children } = $props()
</script>

<ws-toast data-ws={ws}>
    {@render children?.()}
</ws-toast>
