import * as ws from "@axel669/windstorm"

ws.macro("disp.grid")`disp: grid;`

export { ws }
export const wsData = (node, value) => {
    const update = (value) => {
        node.setAttribute("data-ws", value)
    }
    update(value)
    return { update }
}
