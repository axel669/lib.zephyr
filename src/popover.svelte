<script>
    /*md
    [@] Components/Containers/Popover

    # Popover

    The Popover component is for displaying content over something without it
    being modal (you can interact with things under it still).

    ## Base
    [Windstorm Popover](https://axel669.github.io/lib.windstorm/#components-popover)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    ## Variables
    - show
    - hide
    The Popover exposes 2 variables for use: `show` and `hide`. These functions
    are given to the content so that it can control when to display the popover
    content without needing to bind to the parent.

    ## Usage
    ```svelte
    <Popover let:show let:hide>
        <Button on:click={show}>
            Show
        </Button>
        <div ws-x="inset-x[0px] y[0px] h[100px] bg[teal]" slot="content">
            <Button on:click={hide}>
                Hide
            </Button>
        </div>
    </Popover>
    ```
    */

    import { fade } from "svelte/transition"
    import wsx from "./wsx.mjs"

    let visible = false
    const show = () => visible = true
    const hide = () => visible = false
    const anim = { duration: 200 }

    $: wind = {
        $show: true,
        ...$$restProps,
    }
</script>

<ws-popover use:wsx={wind}>
    <slot {show} />
    {#if visible}
        <wind-content ws-x="slot[content] inset[0px]" transition:fade={anim}>
            <slot name="content" {hide} />
        </wind-content>
    {/if}
</ws-popover>
