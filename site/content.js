window.siteConfig = {
    "title": "Zephyr",
    "defaultTheme": "dark",
    "sidebar": [
        {
            "label": "Actions",
            "items": [
                {
                    "label": "vars",
                    "items": "actions-vars"
                },
                {
                    "label": "wsx",
                    "items": "actions-wsx"
                }
            ]
        },
        {
            "label": "Components",
            "items": [
                {
                    "label": "Button",
                    "items": "components-button"
                },
                {
                    "label": "Containers",
                    "items": [
                        {
                            "label": "Dialog",
                            "items": "components-containers-dialog"
                        },
                        {
                            "label": "Drawer",
                            "items": "components-containers-drawer"
                        },
                        {
                            "label": "Flex",
                            "items": "components-containers-flex"
                        },
                        {
                            "label": "Grid",
                            "items": "components-containers-grid"
                        },
                        {
                            "label": "Paper",
                            "items": "components-containers-paper"
                        },
                        {
                            "label": "Popover",
                            "items": "components-containers-popover"
                        },
                        {
                            "label": "Screen",
                            "items": "components-containers-screen"
                        },
                        {
                            "label": "Toaster",
                            "items": "components-containers-toaster"
                        }
                    ]
                },
                {
                    "label": "Data Display",
                    "items": [
                        {
                            "label": "Avatar",
                            "items": "components-data-display-avatar"
                        },
                        {
                            "label": "Badge",
                            "items": "components-data-display-badge"
                        },
                        {
                            "label": "Chip",
                            "items": "components-data-display-chip"
                        },
                        {
                            "label": "DataTable",
                            "items": "components-data-display-datatable"
                        },
                        {
                            "label": "Table",
                            "items": "components-data-display-table"
                        },
                        {
                            "label": "Tooltip",
                            "items": "components-data-display-tooltip"
                        }
                    ]
                },
                {
                    "label": "EntryButton",
                    "items": "components-entrybutton"
                },
                {
                    "label": "Icon",
                    "items": "components-icon"
                },
                {
                    "label": "Input",
                    "items": [
                        {
                            "label": "Area",
                            "items": "components-input-area"
                        },
                        {
                            "label": "Email",
                            "items": "components-input-email"
                        },
                        {
                            "label": "File",
                            "items": "components-input-file"
                        },
                        {
                            "label": "Number",
                            "items": "components-input-number"
                        },
                        {
                            "label": "Password",
                            "items": "components-input-password"
                        },
                        {
                            "label": "Radio",
                            "items": "components-input-radio"
                        },
                        {
                            "label": "Search",
                            "items": "components-input-search"
                        },
                        {
                            "label": "Select",
                            "items": "components-input-select"
                        },
                        {
                            "label": "Text",
                            "items": "components-input-text"
                        },
                        {
                            "label": "Toggle",
                            "items": "components-input-toggle"
                        }
                    ]
                },
                {
                    "label": "Link",
                    "items": "components-link"
                },
                {
                    "label": "Modal",
                    "items": "components-modal"
                },
                {
                    "label": "Notification",
                    "items": "components-notification"
                },
                {
                    "label": "Progress",
                    "items": "components-progress"
                },
                {
                    "label": "Tabs",
                    "items": "components-tabs"
                },
                {
                    "label": "Text",
                    "items": "components-text"
                },
                {
                    "label": "Titlebar",
                    "items": "components-titlebar"
                },
                {
                    "label": "Toast",
                    "items": "components-toast"
                },
                {
                    "label": "ToastMessage",
                    "items": "components-toastmessage"
                }
            ]
        },
        {
            "label": "Event Handlers",
            "items": "event-handlers"
        },
        {
            "label": "Home",
            "items": "home"
        }
    ],
    "sidebarMap": {
        "index": "index.mjs.html",
        "components-data-display-avatar": "avatar.svelte.html",
        "components-data-display-badge": "badge.svelte.html",
        "components-button": "button.svelte.html",
        "components-data-display-chip": "chip.svelte.html",
        "components-containers-dialog": "dialog.svelte.html",
        "components-containers-drawer": "drawer.svelte.html",
        "components-containers-flex": "flex.svelte.html",
        "components-containers-grid": "grid.svelte.html",
        "event-handlers": "handler$.mjs.html",
        "components-icon": "icon.svelte.html",
        "home": "index.mjs.html",
        "components-link": "link.svelte.html",
        "components-modal": "modal.svelte.html",
        "components-notification": "notification.svelte.html",
        "components-containers-paper": "paper.svelte.html",
        "components-containers-popover": "popover.svelte.html",
        "components-progress": "progress.svelte.html",
        "components-input-radio": "radio.svelte.html",
        "components-containers-screen": "screen.svelte.html",
        "components-input-select": "select.svelte.html",
        "components-data-display-table": "table.svelte.html",
        "components-tabs": "tabs.svelte.html",
        "components-text": "text.svelte.html",
        "components-titlebar": "titlebar.svelte.html",
        "components-containers-toaster": "toaster.svelte.html",
        "components-input-toggle": "toggle.svelte.html",
        "components-data-display-tooltip": "tooltip.svelte.html",
        "actions-vars": "vars.mjs.html",
        "actions-wsx": "wsx.mjs.html",
        "components-data-display-datatable": "composed/data-table.svelte.html",
        "components-entrybutton": "composed/entry-button.svelte.html",
        "components-toast": "composed/toast.svelte.html",
        "components-input-area": "input/area.svelte.html",
        "components-input-email": "input/email.svelte.html",
        "components-input-file": "input/file.svelte.html",
        "components-input-number": "input/number.svelte.html",
        "components-input-password": "input/password.svelte.html",
        "components-input-search": "input/search.svelte.html",
        "components-input-text": "input/text.svelte.html",
        "components-toastmessage": "composed/toast/message.svelte.html"
    }
}