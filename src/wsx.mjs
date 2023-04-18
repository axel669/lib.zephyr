import wind from "@axel669/windstorm"
const { wsx } = wind

export default (node, props) => {
    const update = (props) => {
        if (props === null || props === undefined) {
            node.setAttribute("ws-x", null)
            return
        }
        node.setAttribute(
            "ws-x",
            wsx(props)
        )
    }
    update(props)
    return { update }
}
