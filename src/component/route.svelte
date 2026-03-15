<script module>
    const urlChars = "[\\w\\-\\%\\(\\)\\.@!\\*\\^\\$]"
    const urlPattern = (path, exact) => {
        const regexSource = path.replace(
            /:([\w\-]+)/g,
            (_, name) => `\(?<${name}>${urlChars}+\)`
        )
        if (exact === true) {
            return new RegExp(`(?<_path>^${regexSource})$`)
        }
        return new RegExp(`(?<_path>^${regexSource})(((?<=\\/)${urlChars})|\\/|$)`)
    }
</script>

<script>
    import { getContext, setContext } from "svelte"

    import { ctx, resolve, route } from "./routing.svelte.js"

    const {
        path = "",
        component = null,
        props = {},
        exact = false,
        content,
        children,
    } = $props()

    const parent = getContext(ctx.parent) ?? "/"
    const fullPath = resolve(parent, path)

    setContext(ctx.parent, fullPath)
    const pattern = $derived(
        urlPattern(fullPath, exact)
    )
    const match = $derived(
        $route.match(pattern)
    )
    const routeParams = $derived(
        Object.fromEntries(
            Object.entries({ ...match?.groups }).map(
                ([key, value]) => [key, decodeURIComponent(value)]
            )
        )
    )
    const routeInfo = $derived({
        params: routeParams,
        match: routeParams._path,
        route: $route,
    })
    const Content = $derived(component)
</script>

{#if match !== null}
    {#key routeParams._path}
        {#if Content !== null}
            <Content {...props} {routeInfo} />
        {:else}
            {@render (content ?? children)?.(routeInfo, props)}
        {/if}
    {/key}
{/if}
