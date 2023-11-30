<script>
    import wsx from "../wsx.mjs"

    import Paper from "./paper.svelte"

    const id = Math.random().toString(16)

    $: paper = {
        "@dialog": true,
        "$outline": true,
        ...$$restProps
    }
</script>

<slot name="toggle" {id} />
<input type="checkbox" ws-x="hide" {id} />
<ws-modal>
    <ws-paper use:wsx={paper}>
        <slot name="header" {id} />
        <slot name="content" {id} />
        <slot name="footer" {id} />
    </ws-paper>
</ws-modal>
