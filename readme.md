# Zephyr
Zephyr is a svelte binding for the [Windstorm](https://windstorm.axel669.net)
library, with some additional parts to make it look nice in the markup.

[Docs Here](https://zephyr.axel669.net)

## Todo
These are things that I plan to do, but didn't want to hold up the 0.5.x major
changes for svelte 5/runes/improvements.
- Add filter/sort back into data table
- Form element

## Installation
Zephyr can be installed through npm (or the variants like yarn, pnpm, etc).

```bash
npm install @axel669/zephyr
```

## Svelte Config
Zephyr does not output any css of its own, so no configuration is required to
make it styled as expected. For people using Svelte 4+ you will need to make
sure your bundler has the browser conditions set as some components do use
lifecycle functions that will not be bundled without the setting.
[Svelte Docs](https://svelte.dev/docs/v4-migration-guide#browser-conditions-for-bundlers)
about the setting.
