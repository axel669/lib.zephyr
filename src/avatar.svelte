<script>
    /*md
    [@] Components/Data Display/Avatar

    # Avatar

    Displays an image or text in a circular container.

    ## Base
    [Windstorm Avatar](https://axel669.github.io/lib.windstorm/#components-avatar)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### alt `string`
        Alt text for the image. Has no effect if image prop is not used.
    - ### color `string`
        Sets `$color`
    - ### image `string`
        An image url. If no url is provided the text property is displayed.
    - ### text `string`
        Text to show in the avatar area if image is not used.

    ## Example
    ```svelte
    <Avatar image="url" />
    <Avatar image="url" alt="text" />
    <Avatar text="Hi" color="primary" />
    ```
    */

    import wsx from "./wsx.mjs"

    export let alt = ""
    export let image = null

    export let text = ""

    export let color = false

    $: wind = {
        $color: color,
        ...$$restProps
    }
</script>

<ws-avatar use:wsx={wind}>
    {#if image !== null}
        <img src={image} {alt} />
    {:else}
        {text}
    {/if}
</ws-avatar>
