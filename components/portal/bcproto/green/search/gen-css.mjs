// search.src.css の「Nu」(見本の N px)を calc(N * var(--u)) に直して search.css を作る
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const d = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(d, "search.src.css"), "utf8");
const out = src.replace(/(?<![\w.#-])(-?\d+(?:\.\d+)?)u(?![\w-])/g, (_, n) => `calc(${n} * var(--u))`);
writeFileSync(join(d, "search.css"), out);
console.log("search.css", out.length);
