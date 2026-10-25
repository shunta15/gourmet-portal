#!/usr/bin/env node
/**
 * automation/v2/write-parallel.mjs — 記事を書く所(④ claude -p)だけを同時に回す
 *
 * 流れ(速くするため 3 つに分ける):
 *   1. node automation/v2/write.mjs --from-row 80 --prepare-only   … 取得と指示文(Google マップは 1 店ずつ間を空ける)
 *   2. node automation/v2/write-parallel.mjs --concurrency 4        … prompt.md があり result.json が無い店を同時に書く
 *   3. node automation/v2/write.mjs --from-row 80                   … 検査(必要なら 1 回書き直し)と組み込み
 *
 * 書くのは作業フォルダの result.json だけ。データへの組み込み・記録は 3 の write.mjs が行う。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runClaude, preflight, AUTH_HELP } from "./lib/claude.mjs";
import { WORK_DIR, abs } from "./lib/util.mjs";

const argv = process.argv.slice(2);
const conc = Number(argv[argv.indexOf("--concurrency") + 1]) || 4;
const t = () => new Date().toTimeString().slice(0, 8);

const pf = await preflight();
if (pf && pf.ok === false) {
  console.error(`[${t()}] 環境のエラー: ${pf.message || AUTH_HELP}`);
  process.exit(11);
}

// --watch: 取得(--prepare-only)が終わるまで、新しくできた prompt.md を拾い続ける。
// 取得が終わったら WORK_DIR/.prepare-done を置く(下の run-all.sh が置く)。
const watch = argv.includes("--watch");
const taken = new Set();
const pending = () =>
  readdirSync(WORK_DIR)
    .map((k) => path.join(WORK_DIR, k))
    .filter((w) => !taken.has(w) && existsSync(path.join(w, "prompt.md")) && !existsSync(path.join(w, "result.json")));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
console.log(`[${t()}] 開始(同時 ${conc}${watch ? "・取得の完了を待ちながら" : ""})`);

let ok = 0;
let ng = 0;
async function next() {
  for (;;) {
    const w = pending()[0];
    if (w) { taken.add(w); return w; }
    if (!watch || existsSync(path.join(WORK_DIR, ".prepare-done"))) return null;
    await sleep(15000);
  }
}
async function worker() {
  for (;;) {
    const work = await next();
    if (!work) return;
    const key = path.basename(work);
    const prompt = readFileSync(path.join(work, "prompt.md"), "utf8");
    console.log(`[${t()}] ▶ ${key}`);
    const c = await runClaude({ prompt, addDirs: [work, abs("agent-teams/decisions")] });
    writeFileSync(path.join(work, "claude-1.log"), `${c.text}\n\n--- stderr ---\n${c.stderr}\n`);
    const done = existsSync(path.join(work, "result.json"));
    if (done) ok++;
    else ng++;
    console.log(`[${t()}] ${done ? "✓" : "✗"} ${key}(${Math.round(c.durationMs / 1000)} 秒${c.timedOut ? "・時間切れ" : ""})`);
    if (!done && /OAuth|not logged in|authenticat/i.test(`${c.text} ${c.stderr}`)) {
      console.error(`[${t()}] 認証切れのため止めます。${AUTH_HELP}`);
      process.exit(11);
    }
  }
}
await Promise.all(Array.from({ length: conc }, worker));
console.log(`[${t()}] 結果: 書けた ${ok} / 書けなかった ${ng}`);
