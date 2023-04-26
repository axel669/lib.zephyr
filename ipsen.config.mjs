// import fs from "node:fs"

// fs.copyFileSync("dist/browser.js", "test/browser.js")

export default {
    title: "Zephyr",
    source: {
        dir: "src",
        readme: "index.mjs",
        patterns: [
            "!examples/*",
            "!frames/*",
        ],
    },
    dest: {
        clear: true,
        dir: "site",
        readme: "..",
    },
    site: {
        index: "index.mjs",
        defaultTheme: "dark",
    },
    // examples: "test/comp",
    // frames: "test",
}
