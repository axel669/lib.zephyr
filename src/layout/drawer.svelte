<script context="module">
    const defs = {
        select: {
            "$select": true,
            "w.min": "35vw",
            grid: true,
            over: "hidden"
        },
        menu: {
            "$menu": true,
        },
        action: {
            "$action": true,
        }
    }
</script>

<script>
    /*md
    [@] Components/Containers/Drawer

    # Drawer

    A modal container for creating dialogs. The Dialog component is a modal
    element that uses a Paper element for the layout of content. All extra props
    and slots for the Drawer are passed to the underlying Paper component.

    The Drawer component is used as a wrapper for content and is used in
    conjunction with the Modal component to be controlled on screen.

    ## Props
    - ### close `function`
        If passed, this function will be called when the user clicks in the
        empty area outside of the drawer contents.
    - ### height `string`
        Sets the height of the select drawer, no effect for menu and action
        drawers which default to full height of the window.
    - ### type `string`
        The type of drawer. Default is "menu"
        - #### "menu"
            Makes a drawer that slides in on the left side of the screen
        - #### "action"
            Makes a drawer that slides in on the right side of the screen
        - #### "select"
            Makes a drawer that is centered horizontally and slides in from
            the top of the screen

    ## Usage
    `cool-drawer.svelte`
    ```svelte
    <Drawer>
        <Titlebar slot="header">
            <Text slot="title" title>
                Some Title
            </Text>
        </Titlebar>

        <span>Content</span>
    </Drawer>
    ```

    `app.svelte`
    ```svelte
    <Modal component={CoolDrawer} />
    <EntryButton this={Modal} component={CoolDrawer}>
        Open Cool Dialog
    </EntryButton>
    ```
    */
    import wsx from "../wsx.mjs"

    import Paper from "./paper.svelte"

    export let height
    export let type = "menu"

    const trick = (node, options) => ({
        delay: 0,
        duration: 250,
        css: () => "",
    })

    $: container = {
        ...defs[type],
        h: (type === "select") ? height : "100%",
        grid: true,
    }
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-interactive-supports-focus -->
<wind-drawer-container use:wsx={container} on:click|stopPropagation
role="menubar" transition:trick>
    <Paper {...$$restProps}>
        <slot name="header" slot="header" />
        <slot />
        <slot name="footer" slot="footer" />
    </Paper>
</wind-drawer-container>
