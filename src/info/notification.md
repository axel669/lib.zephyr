# Notification

Displays a piece of content that stands out from the surrounding content and
can also be used for toast messages. Optionally has some interactable
elements embedded.

Expects 1-2 child nodes and will display them on the sides of the
notification with space between them. This means that reversing the order
of the child nodes will flip which sides they appear on.

## Base
[Windstorm Notification](https://axel669.github.io/lib.windstorm/#components-notification)

## Props
All [windstorm functions](https://axel669.github.io/lib.windstorm/#css-shorthands)
are supported.

- ### color
    Sets `$color` and uses the fill style for coloration.

## Usage
```svelte
<Notification>
    <Icon name="info-hexagon">
        Some kind of information
    </Icon>
</Notification>
<Notification color="danger">
    <Icon name="alert-hexagon">
        Something broke
    </Icon>

    <Button>
        Cancel
    </Button>
</Notification>
```
