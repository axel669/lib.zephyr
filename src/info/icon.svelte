<script>
    import wsx from "../wsx.mjs"

    export let name
</script>

<ws-icon class="ti-{name}" use:wsx={$$restProps}>
    <slot />
</ws-icon>
