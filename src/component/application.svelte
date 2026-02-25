<script>
    import Dialog from "./dialog.svelte"
    import Toaster from "./toaster.svelte"
    import { wsAttr } from "../ws.js"

    const {
        baseline = "",
        theme = "tron",
        children,
    } = $props()
</script>

<svelte:body use:wsAttr={`#theme.${theme}; ${baseline}`} />

<Toaster />
<Dialog />
{@render children?.()}
