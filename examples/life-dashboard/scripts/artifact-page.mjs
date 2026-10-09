// Turns the `--mode artifact` build into one self-contained page body for a
// claude.ai Artifact: inlines the script and stylesheet, drops links to files
// that aren't published (icons, manifest), and strips the document skeleton,
// which the Artifact host supplies.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "..", "dist-artifact");
const html = readFileSync(path.join(dir, "index.html"), "utf8");
const read = (url) => readFileSync(path.join(dir, url.replace(/^\.?\//, "")), "utf8");

const scripts = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => read(m[1]));
const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => read(m[1]));
if (scripts.length !== 1 || styles.length !== 1) throw new Error(`expected 1 script and 1 stylesheet, got ${scripts.length} and ${styles.length}`);
const title = html.match(/<title>.*?<\/title>/)[0];

// A literal "</script" inside the bundle would end the inline tag early.
const js = scripts[0].replace(/<\/script/gi, "<\\/script");

const page = `${title}
<meta name="theme-color" content="#08090a">
<style>${styles[0]}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
const out = path.join(dir, "spike-life-dashboard.html");
writeFileSync(out, page);
console.log(`${path.relative(process.cwd(), out)}: ${(page.length / 1024).toFixed(0)} KiB`);
