import fs from "node:fs/promises"

import { compile } from "svelte/compiler"

const source = await fs.readFile("../src/app.svelte", "utf8")

const result = compile(
    source
)

console.log(result.js.code)
