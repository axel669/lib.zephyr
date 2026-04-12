import asuid from "@axel669/asuid"
import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import html from "@axel669/rollup-html-input"
import terser from "@rollup/plugin-terser"
import del from "rollup-plugin-delete"
import copy from "@axel669/rollup-copy-static"

import sidebar from "./sidebar-plugin.js"

export default {
    input: "docsite/index.html",
    output: {
        file: `site/app-${asuid()}.js`,
        format: "iife",
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
            targets: ["site/*.js", "site/*.js.map"],
            force: true,
        }),
        sidebar,
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
        terser(),
        copy("docsite/static"),
    ]
}
