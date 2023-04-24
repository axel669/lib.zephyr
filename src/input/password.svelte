<script>
    /*md
    [@] Components/Input/Password

    # Input.Password

    A multiline text input component.

    ## Base
    [Windstorm Labled Control](https://axel669.github.io/lib.windstorm/#components-labeled-control)
    using an input with type="password"

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
    <Input.Password bind:value />
    <Input.Password bind:value color="primary" />
    <Input.Password bind:value label="Wat" hint="Blep"/>
    <Input.Password bind:value bind:valid validate={txt => txt.indexOf("a") > 0} />
    ```
    */

    import wsx from "../wsx.mjs"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null

    export let value = ""

    export let validate = () => true
    export let valid

    let input = null
    export const focus = () => input.focus()

    $: wind = {
        "@flat": flat,
        "@control": true,
        $color: color,
        ...$$restProps,
    }

    $: valid = validate(value)
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <input {...$$restProps}
    type="password"
    bind:value
    on:focus
    on:blur
    bind:this={input}
    />

    <slot name="start" />
    <slot name="end" />
</label>
