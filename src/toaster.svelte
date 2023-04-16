<script>
    import wsx from "./wsx.mjs"

    export let position = "tc"

    $: wind = {
        [`$${position}`]: true,
        ...$$restProps,
    }
</script>

<ws-toaster use:wsx={wind}>
    <slot />
</ws-toaster>
