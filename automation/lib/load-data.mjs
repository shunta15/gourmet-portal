/**
 * load-data.mjs — lib/data.ts（拡張子なし import・@/ エイリアスを含む）を node から読み込むための小さなローダー。
 *
 * 使い方:
 *   import { loadData } from "../lib/load-data.mjs";
 *   const data = await loadData();            // { RESTAURANTS, FEATURES, FEATURE_ARTICLES, ... }
 *   const { SCENES } = await loadLib("scenes");
 *
 * node 22.18+ の型除去（type stripping）と module.registerHooks を使う。
 * lib/ 配下の .ts が enum / namespace を使っていないことが前提。
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

let installed = false;
function install() {
  if (installed) return;
  installed = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      let base = null;
      if (specifier.startsWith("@/")) {
        base = path.join(ROOT, specifier.slice(2));
      } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
        base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
      }
      if (base) {
        for (const cand of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
          if (path.extname(cand) && existsSync(cand) && !existsSync(cand + "/")) {
            return nextResolve(pathToFileURL(cand).href, context);
          }
        }
      }
      return nextResolve(specifier, context);
    },
  });
}

export async function loadLib(name) {
  install();
  return import(pathToFileURL(path.join(ROOT, "lib", `${name}.ts`)).href);
}
export const loadData = () => loadLib("data");
export { ROOT };
