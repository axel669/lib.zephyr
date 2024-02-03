# LoadZone
A component for putting content that is behind an async function.

## Props

### message
The text to show while the promise is pending.

### source
`Promise`

The promise that will resolve into some kind of content-related information.

## Slots

### default
The default slot will be shown when the promise resolves.

### loading
The content to show while the promise is pending. Overrides the default of a
load spinner with some text.

### error
The content to show when the promise rejects. Use `let:error` to get the error
that was thrown.

## Example

```svelte
<LoadZone source={asyncThing} let:result>
    <div>
        content
    </div>
    <div>
        {JSON.stringify(result)}
    </div>

    <div slot="error">
        :(
    </div>
</LoadZone>
```
