import ws from "./wind.js"

export const none = Symbol("none")
export default (node, props) => {
    const update = (props) => {
        const { slot = null, ...goodProps } = props ?? {}
        if (goodProps === null || goodProps === undefined) {
            node.setAttribute("ws-x", null)
            return
        }
        const formatted = Object.entries(goodProps).reduce(
            (props, [key, value]) => {
                if (key === none) {
                    return props
                }
                const realKey = key.replace(/^!/, "").replaceAll("_", ":")
                props[realKey] = value
                return props
            },
            {}
        )
        node.setAttribute(
            "ws-x",
            ws.x(formatted)
        )
    }
    update(props)
    return { update }
}
