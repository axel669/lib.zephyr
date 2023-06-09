<script>
    /*md
    [@] Components/Containers/Paper

    # Paper

    The Paper component is a container that has slots for header and footer
    content that is independant from the regular content scrolling. It also uses
    Flex as a default layout for its slotted content, but allows any container
    to be used as a layout without increasing the indentation of all the content
    needlessly.

    ## Base
    [Windstorm Paper](https://axel669.github.io/lib.windstorm/#components-paper)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### card `bool`
        Sets `@outline`
    - ### square `bool`
        Sets `r[0px]`
    - ### layout `Component`
        Sets the layout the card will use to display content. Default is Flex.
    - ### scrollable `bool`
        Sets `over[auto]` on the layout component
    - ### l-*
        Any prop that is prefixed with `l-` will be passed to the layout
        component, with the remaining props acting as the normal wind functions
        on the paper itself

    ## Slots
    - ### header
        The header content for the Paper. Header content does not scroll with
        the regular content of the component (acts sticky)
    - ### footer
        The footer content for the Paper. Same scrolling properties as the
        header slot
    - ### content/default
        The default slot (unnamed) for Paper will be rendered in the layout
        component defined in the props. As an alternative, a content slot may
        be used that will be rendered directly in the content slot of the Paper
        without the layout component/props being rendered (useful when nesting
        papers for example)

    ## Usage
    ```svelte
    <Paper>
        <Titlebar slot="header">
            <Text slot="title" title>
                Some Title
            </Text>
        </Titlebar>

        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
    </Paper>
    <Paper l-pad="0px" m="4px">
        <Titlebar slot="header">
            <Text slot="title" title>
                Some Screen
            </Text>
        </Titlebar>

        <Paper slot="content">
            <Tabs slot="header" {options} bind:value />

            <div>Content 1</div>
            <div>Content 2</div>
            <div>Content 3</div>
        </Paper>

        <div slot="footer">
            Wat
        </div>
    </Paper>
    ```
    */

    import Flex from "./flex.svelte"
    import wsx from "./wsx.mjs"

    export let color
    export let card = false
    export let square = false
    export let layout = Flex
    export let scrollable = true

    $: props = Object.entries($$restProps).reduce(
        (p, [key, value]) => {
            const [target, name] =
                (key.startsWith("l-") === true)
                ? [ p.layout, key.slice(2) ]
                : [ p.paper, key ]
            target[name] = value
            return p
        },
        { layout: {}, paper: {} }
    )

    $: layoutProps = {
        over: scrollable ? "auto" : false,
        ...props.layout,
    }
    $: wind = {
        $color: color,
        "@outline": card,
        r: square && "0px",
        ...props.paper,
    }
</script>

<ws-paper use:wsx={wind}>
    <slot name="header" />
    {#if $$slots.content}
        <slot name="content" slot="content" />
    {:else}
        <svelte:component this={layout} {...layoutProps} slot="content">
            <slot />
        </svelte:component>
    {/if}
    <slot name="footer" />
</ws-paper>
