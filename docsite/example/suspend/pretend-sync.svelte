<script>
    const { time } = $props()
</script>

<div>
    Current Time: {new Date(time).toLocaleString()}
</div>
