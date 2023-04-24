<script>
    /*md
    [@] Components/Input/Area

    # Input.Area

    A multiline text input component.

    ## Base
    [Windstorm Labled Control](https://axel669.github.io/lib.windstorm/#components-labeled-control)
    using a `<textarea>`

    ## Props
    All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
    are supported.

    - ### color `string`
        Sets `$color`
    - ### error `string`
        Shows an error message under the input
    - ### flat `bool`
        Sets `@flat`
    - ### hint `string`
        Shows a hint under the label. If no label is provided, the hint will not
        be shown either
    - ### label `string`
        The label for the input
    - ### transform `function`
        If given, it will transform the text value from the input and set the
        `tvalue` to the result
    - ### tvalue
        Value that can be bound to as the output of the transform function.
        Setting has no effect
    - ### validate `function`
        If given, will check the transformed output against a validation
        criteria and store the result in `valid`
    - ### valid `bool`
        Value that can be bound to as the output of the validation function.
        Setting has no effect
    - ### value `string`
        The value of the textarea, can be bound to

    ## Functions
    - focus()\\
        Focuses the textarea

    ## Usage
    ```js
    import { Input } from "@axel669/svelte-wind"
    ```
    ```svelte
    <Input.Area bind:value />
    <Input.Area bind:value color="primary" />
    <Input.Area bind:value label="Wat" hint="Blep"/>
    <Input.Area bind:value bind:tvalue transform={txt => txt.toLowerCase()} />
    <Input.Area bind:value bind:valid validate={txt => txt.indexOf("a") > 0} />
    ```
    */

    import wsx from "../wsx.mjs"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null

    export let value = ""

    export let transform = i => i
    export let tvalue
    export let validate = () => true
    export let valid

    let area = null
    export const focus = () => area.focus()

    $: wind = {
        "@flat": flat,
        "@control": true,
        $color: color,
        ...$$restProps,
    }

    $: tvalue = transform(value ?? "")
    $: valid = validate(tvalue)
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <textarea {...$$restProps} bind:value on:focus on:blur bind:this={area} />

    <slot name="start" />
    <slot name="end" />
</label>
