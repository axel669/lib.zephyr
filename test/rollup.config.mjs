import path from "node:path"

import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import html from "@axel669/rollup-html-input"
import terser from "@rollup/plugin-terser"

export default {
    input: "test/src/index.html",
    output: {
        file: "test/build/app.mjs",
        format: "esm"
    },
    plugins: [
        {
            resolveId(id) {
                if (id !== "@lib") {
                    return
                }
                return path.resolve("index.mjs")
            }
        },
        html(),
        svelte(),
        resolve(),
        // terser(),
    ]
}
