import ws from "@axel669/windstorm"

export default (node, props) => {
    const { slot = null, ...goodProps } = props
    const update = (goodProps) => {
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
    update(goodProps)
    return { update }
}
