export const frameDelay = (frames, action) => {
    let frameCount = 0
    const process = () => {
        frameCount += 1
        if (frameCount >= frames) {
            action()
            return
        }
        requestAnimationFrame(process)
    }
    requestAnimationFrame(process)
}
