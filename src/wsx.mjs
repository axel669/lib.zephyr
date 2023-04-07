import wind from "@axel669/windstorm"
const { wsx } = wind

export default (node, props) => {
    const update = (props) => node.setAttribute(
        "ws-x",
        wsx(props)
    )
    update(props)
    return { update }
}
