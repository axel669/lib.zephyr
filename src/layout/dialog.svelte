<script>
    import { fade } from "svelte/transition"

    import wsx from "../wsx.js"

    import Paper from "./paper.svelte"

    const props = $props()

    const trick = (node, options) => ({
        delay: 0,
        duration: 250,
        css: () => "",
    })
    const onclick = (evt) => {
        evt.stopPropagation()
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<wind-wrapper transition:trick ws-x="@@dialog [grid]" {onclick} role="dialog">
    <Paper {...props} />
</wind-wrapper>
