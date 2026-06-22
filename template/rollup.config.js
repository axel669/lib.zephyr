import asuid from "@axel669/asuid"
import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import html from "@axel669/rollup-html-input"
import del from "rollup-plugin-delete"

export default {
    input: "src/index.html",
    output: {
        file: `artifacts/app-${asuid()}.js`,
        format: "esm",
        sourcemap: true,
    },
    onwarn: (msg, next) => {
        if (msg.code === "CIRCULAR_DEPENDENCY" && msg.message.includes("svelte")) {
            return
        }
        next(msg)
    },
    plugins: [
        del({
            targets: [
                "artifacts/app-*.js",
                "artifacts/app-*.js.map"
            ],
            force: true,
        }),
        html(),
        svelte({
            emitCss: false,
            compilerOptions: {
                generate: "client",
                runes: true,
                dev: true,
            }
        }),
        resolve({ browser: true }),
    ]
}
