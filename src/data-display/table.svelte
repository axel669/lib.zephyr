<script>
    import wsx from "../wsx.mjs"

    export let color = false
    export let fillHeader = false
    export let data = []

    $: wind = {
        "$color": color,
        "$header-fill": fillHeader,
        ...$$restProps,
    }
</script>

<table use:wsx={wind}>
    <thead>
        <slot name="header">
            <tr>
                <th>No Header Template</th>
            </tr>
        </slot>
    </thead>
    <tbody>
        {#each data as row}
            {#if row === undefined}
                <slot name="empty-row" />
            {:else}
                <slot name="row" {row}>
                    <tr>
                        <th>No Row Template</th>
                    </tr>
                </slot>
            {/if}
        {/each}
    </tbody>
</table>
