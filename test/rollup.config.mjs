import path from "node:path"

import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import html from "@axel669/rollup-html-input"
import terser from "@rollup/plugin-terser"

export default {
    input: "test/src/index.html",
    output: {
        file: "test/build/app.mjs",
        format: "iife",
        sourcemap: true,
    },
    plugins: [
        {
            resolveId(id) {
                if (id !== "@axel669/svelte-wind") {
                    return
                }
                return path.resolve("src/index.mjs")
            }
        },
        html(),
        svelte({
            emitCss: false
        }),
        resolve({ browser: true }),
        // terser(),
    ]
}
