# Suspend
Allows properties that are promises to be resolved before being passed into
content without needing to handle all of the promises directly. This means the
rendered content can be built as if it is synchronous withour worrying about
promise resolution for props.

## Props
All of the props passed into `Suspend` are passed to the rendered component
(except `!component`), after all the promises have been resolved among the prop
values. When all the promises have resolved, the resolved values are passed to
the rendered component so that it does not need any code to handle promises for
any of the props.

### component _Component_
The component that should be rendered once the promises have resolved.

## Snippets

### snippet(props)
Renders a snippet instead of a full component when the promises have resolved.
Needs to be a separate snippet/prop because rendering snippets is a different
bit of code in svelte than rendering component.

### error(errorDetails)
Content to display when the first promise rejects. Maybe in the future I make
a variant that gives you all the promise results, including all the ones that
fail.

### loading()
Content to display while the promises are pending.
