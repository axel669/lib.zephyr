const head = document.head
const macros = document.createElement("style")
macros.setAttribute("ws-root", "")
macros.innerHTML = `
.ws-style {
    --con: "contain: {$}";
}
`
head.append(macros)
