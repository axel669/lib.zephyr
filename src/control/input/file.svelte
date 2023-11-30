<script>
    /*md
    [@] Components/Input/File

    # Input.File

    A multiline text input component.

    ## Base
    [Windstorm Labled Control](https://axel669.github.io/lib.windstorm/#components-labeled-control)
    using an input with type="file"

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
    - ### validate `function`
        If given, will check the transformed output against a validation
        criteria and store the result in `valid`
    - ### valid `bool`
        Value that can be bound to as the output of the validation function.
        Setting has no effect
    - ### value `string`
        The value of the textarea, can be bound to

    ## Usage
    ```js
    import { Input } from "@axel669/svelte-wind"
    ```svelte
    <Input.File bind:value />
    <Input.File bind:value color="primary" />
    <Input.File bind:value label="Wat" hint="Blep"/>
    <Input.File bind:value bind:valid validate={file => file[0].type !== "text"} />
    ```
    */

    import wsx from "../../wsx.mjs"

    export let flat = false
    export let label
    export let color = "default"
    export let error = null
    export let hint = null
    export let disabled

    export let value

    export let validate = () => true
    export let valid

    const handler = (evt) => value = [...evt.target.files]

    $: wind = {
        "$flat": flat,
        "@control": true,
        "$color": color,
        ...$$restProps,
    }

    $: valid = validate(value)
</script>

<label use:wsx={wind} ws-error={error}>
    {#if label}
        <span ws-x="$text" ws-hint={hint}>{label}</span>
    {/if}
    <input {disabled} {...$$restProps} type="file" on:input={handler} />

    <slot name="start" />
    <slot name="end" />
</label>
