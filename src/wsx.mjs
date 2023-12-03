import ws from "@axel669/windstorm"

ws.custom("outline", (o) => ws.prop("outline", o))

export default (node, props) => {
    const update = (props) => {
        const { slot = null, ...goodProps } = props ?? {}
        if (goodProps === null || goodProps === undefined) {
            node.setAttribute("ws-x", null)
            return
        }
        node.setAttribute(
            "ws-x",
            ws.x(goodProps)
        )
        if (slot === null) {
            node.removeAttribute("slot")
            return
        }
        node.setAttribute("slot", slot)
    }
    update(props)
    return { update }
}
