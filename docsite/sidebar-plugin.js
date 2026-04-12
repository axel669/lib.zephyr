import yaml from "yaml"
import fs from "fs-jetpack"
import mdit from "markdown-it"

const log = {
    info: (item) => console.log(item),
    deep: (item) => console.dir(item, { depth: null }),
}

log.info("Loading Examples...")

const md = mdit()
const filesystems = {
    root: fs,
    docsite: fs.cwd("docsite"),
    example: fs.cwd("docsite/example"),
    docs: fs.cwd("docsite/docs")
}
const fsRegex = /^@(?<fsys>\w+):(?<loc>.+)$/
const readfile = async (file) => {
    const { fsys, loc } = file.match(fsRegex).groups
    return await filesystems[fsys].readAsync(loc)
}
const resolve = (file) => {
    const { fsys, loc } = file.match(fsRegex).groups
    return filesystems[fsys].path(loc)
}

const sitemap = yaml.parse(
    await readfile("@docsite:sidebar.yml")
)
const fsvar = fs.cwd("docsite/docs/vars")
const mdvars = Object.fromEntries(
    fsvar.list().map(
        file => [
            file.slice(0, -3),
            fsvar.read(file)
        ]
    )
)

// log.deep(sitemap)

const imports = []
const loadExample = (name, file) => {
    if (file === undefined) {
        return ""
    }
    const loc = resolve(file)
    const relloc = loc.slice(
        filesystems.root.cwd().length
    )
    const importLoc = JSON.stringify(loc)
    const ghpath = JSON.stringify(
        relloc.replaceAll("\\", "/")
    )
    imports.push(`import ${name}Example from ${importLoc}`)
    return `    example: ${name}Example,\n    exampleFile: ${ghpath},\n`
}
const renderString = (name, value) => {
    if (value === undefined) {
        return ""
    }
    return `    ${name}: ${JSON.stringify(value)},\n`
}
const renderContent = async (target) => {
    if (target === undefined) {
        return ""
    }
    const content = await readfile(target)
    // console.log(content)
    const markdown = md.render(
        content.replace(
            /\{\{var:([^\}]+)\}\}/g,
            (_, name) => mdvars[name]
        )
    )
    return renderString("content", markdown)
}
const loadChildren = async (list) => {
    if (list === undefined) {
        return ""
    }

    const items = await loadFiles(list)
    const indented = items.join(",\n").replace(
        /^/gm,
        "    "
    )
    return `    children: [\n${indented}\n],\n`
}

const loadFiles = async (list) => {
    if (list === undefined) {
        return []
    }
    const mapped = []
    for (const entry of list) {
        const content = await renderContent(
            (entry.docs === true)
                ? `@docs:${entry.url.slice(1)}.md`
                : entry.docs
        )
        const url = renderString("url", entry.url)
        const label = renderString("label", entry.label)
        const example = loadExample(
            entry.label,
            (entry.example === true)
                ? `@example:${entry.url.slice(1)}.svelte`
                : entry.example
        )
        const children = await loadChildren(entry.children)

        const item = `{\n${label}${url}${content}${example}${children}}`
        mapped.push(item)
    }
    return mapped
}
const sidebar = await loadFiles(sitemap.sidebar)

const code = `${imports.join("\n")}\nexport default [\n${sidebar.join(",\n")}\n]`

log.info("Examples Loaded")
log.info(code)

export default {
    resolveId(id) {
        if (id === "$sidebar") {
            return id
        }
        return undefined
    },
    async load(id) {
        if (id !== "$sidebar") {
            return undefined
        }
        return code
    }
}
