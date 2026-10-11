// 業種の大分類（lib/cuisineBroad.ts の 7 つ）に入らない店を一覧にする点検スクリプト。置くだけ（自動パイプラインには組み込まない）。
//   使い方: node automation/check-cuisine-broad.mjs
//   未分類が 1 件でもあれば、店 ID・店名・業種の表記を出して終了コード 1。0 件なら 0。
// 対象は、コード側の店（lib/data.ts の RESTAURANTS。DB だけにある店は含まない）。
// 直し方: 業種の表記の語を lib/cuisineBroad.ts の keywords に足す、または、その店自身のデータ（本文・見出し・タグ）で系統を確かめて BROAD_BY_ID に店 ID を足す。
//   店名の中間一致で振り分けない（ID の完全一致だけ）。
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");

// TypeScript を読み込む（「@/」は ROOT、server-only は空に）
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith("@/")) request = path.join(ROOT, request.slice(2));
  if (request === "server-only") request = path.join(ROOT, "node_modules/next/dist/compiled/server-only/empty.js");
  return origResolve.call(this, request, parent, ...rest);
};
require.extensions[".ts"] = function (module, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true },
    fileName: filename,
  });
  module._compile(out.outputText, filename);
};

const { RESTAURANTS } = require(path.join(ROOT, "lib/data.ts"));
const { countByBroad, unclassifiedShops } = require(path.join(ROOT, "lib/cuisineBroad.ts"));

console.log(`店 ${RESTAURANTS.length} 軒`);
console.log(countByBroad(RESTAURANTS).map((c) => `${c.label} ${c.count}`).join(" / "));
const un = unclassifiedShops(RESTAURANTS);
if (un.length === 0) {
  console.log("未分類 0 件（全店が 7 つの大分類のどれかに入っています）");
  process.exit(0);
}
console.log(`未分類 ${un.length} 件:`);
for (const r of un) console.log(`  ${r.id}\t${r.name}\t業種表記: ${r.cuisine}`);
process.exit(1);
