export default ({ flat, fill, outline }, def = "$flat") => {
    if (outline === true) {
        return "$outline"
    }
    if (fill === true) {
        return "$fill"
    }
    if (flat === true) {
        return "$flat"
    }
    return def
}
