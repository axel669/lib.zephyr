<script>
    /*md
    [@] Components/Progress

    # Progress

    Displays progress bar with an optional label.

    ## Base
    [Windstorm Progress Bar](https://axel669.github.io/lib.windstorm/#components-progress-bar)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### label `string`
        The label for the bar
    - ### max `number`
        Sets the max value for the progress bar. Default is 1
    - ### outline `bool`
        Sets `@outline`
    - ### row `bool`
        Sets `$row`
    - ### value `number`
        Sets the value of the progress bar. Combined with max to determine how
        filled the bar is.

    ## Usage
    ```svelte
    <Progress color="primary" value={0.1} />
    <Progress color="primary" value={5} max={10} />
    ```
    */

    import wsx from "../wsx.mjs"

    export let value = 0
    export let max = 1
    export let color = "default"
    export let outline = false
    export let row = false
    export let label = null

    $: wind = {
        "@progress": true,
        "$outline": outline,
        "$color": color,
        $row: row,
        ...$$restProps,
    }
</script>

<label use:wsx={wind}>
    {#if label}
        <span ws-x="$text t-ws[nowrap]">{label}</span>
    {/if}
    <progress {value} {max} />
</label>
