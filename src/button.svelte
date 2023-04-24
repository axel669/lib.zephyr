<script>
    /*md
    [@] Components/Button

    # Button

    Basic clickable component for handling user interaction.

    ## Base
    [Windstorm Button](https://axel669.github.io/lib.windstorm/#components-button)

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### compact `bool`
        Sets `$compact`
    - ### for `string`
        The ID of a dom element that the button is tied to. Only works with
        label buttons.
    - ### label `string`
        If true, the button will be displayed in the DOM using a <label>
        element instead of a <button>.
    - ### variant `string`
        Sets the button type to `@<variant>` (ex: "flat" -> `@flat`). Default
        variant is "flat". Currently supports "flat", "fill", "outline".

    ## Events
    - click

    ## Example
    ```svelte
    <Button on:click={action}>
        Flat Button
    </Button>
    <Button on:click={action} variant="outline">
        Outlined Button
    </Button>
    <Button on:click={action} variant="fill" color="danger">
        Filled Button
    </Button>

    <Button label for="thing">
        Toggle
    </Button>
    <input type="checkbox" id="toggle" />
    ```
    */

    import wsx from "./wsx.mjs"

    export let color = "default"
    export let compact = false
    export let variant = "flat"

    let _for = ""
    export { _for as for }
    export let label = false

    $: wind = {
        [`@${variant}`]: true,
        $color: color,
        $compact: compact,
        "@button": label,
        ...$$restProps
    }
</script>

{#if label === true}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <label use:wsx={wind} for={_for} on:click|stopPropagation>
        <slot />
    </label>
{:else}
    <button use:wsx={wind} on:click|stopPropagation>
        <slot />
    </button>
{/if}
