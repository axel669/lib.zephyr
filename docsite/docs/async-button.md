# AsyncButton
A button that makes it simpler to fire off async functions
in response to button clicks. In addition to calling the
function, the button will disable itself during the
function duration and show a load spinner inside the
button.

## Props
> AsyncButton supports all of the [Button](#/button) props.

### hideSpinner _bool_
If true, hides the load spinner while the button is
waiting (the button will still be disabled). Default
is `false`

### onresolve _function_
A function that fires once the promise from onclick
is resolved, with the value of the result as its
only argument.

### spinnerWS _string_
Windstorm text to pass to the load spinner.
