<script>
    import { Title } from "#lib"

    const {
        code,
        component,
        docs,
        name,
        page,
    } = $props()

    page.push(name)
    const Component = $derived(component)
</script>

<Title data={name} />

<div>
    {@html docs}

    <h2>Example</h2>

    <Component />
    {#each code as [filename, codeHTML]}
        <h3>{filename}</h3>
        <pre class="language-svelte"><code class="language-svelte">{@html codeHTML}</code></pre>
    {/each}
</div>
