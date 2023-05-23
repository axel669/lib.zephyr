/*md
[@] Home

# Zephyr
Zephyr is a svelte binding for the
[Windstorm](https://www.npmjs.com/package/@axel669/windstorm)
library.

[Docs Here](https://svelte-wind.axel669.net)

## Installation
Zephyr can be installed through npm (or the variants like yarn, pnpm, etc).

```bash
npm install @axel669/svelte-wind
```

## Usage
Components can be imported individually from the library for tree-shaking, or
the entire lib can imported at once, but I dunno how big that bundle will be.

```svelte
<script>
    //  individual import for tree shaking
    import { Button } from "@axel69/svelte-wind"

    //  bring the whole thing to keep it simple
    import * as Wind from "@axel69/svelte-wind"
</script>

<!-- the wsx action can be used to setup the ws-x needed for the body -->
<svelte:body use:wsx={{theme, "@app": true}} />

<Button on:click={stuff}>
    I'm a button!
</Button>

<Wind.Button on:click={stuff}>
    I'm also button!
</Wind.Button>
```

### Svelte Config
No special configuration of svelte is required, nor is there a separate plugin
that needs to be added. Just have svelte and you're good to go.
*/

export { default as Avatar } from "./avatar.svelte"
export { default as Badge } from "./badge.svelte"
export { default as Button } from "./button.svelte"
export { default as Chip } from "./chip.svelte"
export { default as Details } from "./details.svelte"
export { default as Dialog } from "./dialog.svelte"
export { default as Drawer } from "./drawer.svelte"
export { default as Flex } from "./flex.svelte"
export { default as Grid } from "./grid.svelte"
export { default as Icon } from "./icon.svelte"
export { default as InlineDialog } from "./inline-dialog.svelte"
export { default as Link } from "./link.svelte"
export { default as Modal } from "./modal.svelte"
export { default as Notification } from "./notification.svelte"
export { default as Paper } from "./paper.svelte"
export { default as Popover } from "./popover.svelte"
export { default as Progress } from "./progress.svelte"
export { default as Radio } from "./radio.svelte"
export { default as Screen } from "./screen.svelte"
export { default as Select } from "./select.svelte"
export { default as Table } from "./table.svelte"
export { default as Tabs } from "./tabs.svelte"
export { default as Text } from "./text.svelte"
export { default as Titlebar } from "./titlebar.svelte"
export { default as Toaster } from "./toaster.svelte"
export { default as Toggle } from "./toggle.svelte"
export { default as Tooltip } from "./tooltip.svelte"

export { default as CircleSpinner } from "./circle-spinner.svelte"
export { default as HexagonSpinner } from "./hexagon-spinner.svelte"

export { default as Alert } from "./dialogs/alert.svelte"
export { default as Confirm } from "./dialogs/confirm.svelte"

export { default as DataTable } from "./composed/data-table.svelte"
export { default as EntryButton } from "./composed/entry-button.svelte"
export { default as Toast } from "./composed/toast.svelte"

export { default as wsx } from "./wsx.mjs"

export * as Input from "./input/elems.mjs"

export * from "./handler$.mjs"

export { default as TheLastAirbender } from "./avatar.svelte"
