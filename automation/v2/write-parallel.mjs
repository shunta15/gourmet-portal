#!/usr/bin/env node
/**
 * automation/v2/write-parallel.mjs — 記事を書く所(④ claude -p)だけを同時に回す
 *
 * 流れ(速くするため 3 つに分ける):
 *   1. node automation/v2/write.mjs --from-row 80 --prepare-only   … 取得と指示文(Google マップは 1 店ずつ間を空ける)
 *   2. node automation/v2/write-parallel.mjs --concurrency 4        … prompt.md があり result.json が無い店を同時に書く
 *   3. node automation/v2/write.mjs --from-row 80                   … 検査(必要なら 1 回書き直し)と組み込み
 *
 * --research --max-web N: 材料不足の店を Web 検索で書き直す(Web の道具の回数の上限 N、既定 8)。
 *
 * 書くのは作業フォルダの result.json だけ。データへの組み込み・記録は 3 の write.mjs が行う。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runClaude, preflight, AUTH_HELP, usingApiKey } from "./lib/claude.mjs";
import { WORK_DIR, abs } from "./lib/util.mjs";

const argv = process.argv.slice(2);
const conc = Number(argv[argv.indexOf("--concurrency") + 1]) || 4;
// --budget-usd: これを超えたら新しい店を書き始めない(書き途中の店は終わらせる)。API のクレジットの残りより低く決める。
const budget = argv.includes("--budget-usd") ? Number(argv[argv.indexOf("--budget-usd") + 1]) : Infinity;
let spent = 0;
const t = () => new Date().toTimeString().slice(0, 8);

const pf = await preflight();
if (pf && pf.ok === false) {
  console.error(`[${t()}] 環境のエラー: ${pf.message || AUTH_HELP}`);
  process.exit(11);
}

// --watch: 取得(--prepare-only)が終わるまで、新しくできた prompt.md を拾い続ける。
// 取得が終わったら WORK_DIR/.prepare-done を置く(下の run-all.sh が置く)。
const watch = argv.includes("--watch");
// --research: 公式サイトが無く材料が足りなかった店の書き直し用(オーナー 2026-10-25「もっと検索かけて現状でわかる情報で作成してみて」)
const research = argv.includes("--research");
const taken = new Set();
const pending = () =>
  readdirSync(WORK_DIR)
    .map((k) => path.join(WORK_DIR, k))
    .filter((w) => !taken.has(w) && existsSync(path.join(w, "prompt.md")) && !existsSync(path.join(w, "result.json")));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
console.log(`[${t()}] 認証: ${usingApiKey() ? "API キー(Console のクレジット)" : "端末の claude のログイン"}・予算 ${budget === Infinity ? "なし" : "$" + budget}`);
console.log(`[${t()}] 開始(同時 ${conc}${watch ? "・取得の完了を待ちながら" : ""})`);

const maxWeb = argv.includes("--max-web") ? Number(argv[argv.indexOf("--max-web") + 1]) || 8 : 8;
const RESEARCH = `- この店は公式サイトが無く、材料のフォルダだけでは事実が足りなかった店です。今回は WebSearch と WebFetch で、今ネットで分かる事実を集めて書きます(下の「食べログ・ホットペッパー…は使わない」の決まりは、この節の決まりに置き換えます)。
- 検索は必ず「店名 市区町村」か「電話番号」で行います。ページの住所か電話番号が store.json と一致したページだけを使います(どちらも無いページ・違うページは同名の別の店として無視)。
- 使ってよい出どころ: 店の公式の SNS・ブログの公開ページ、自治体・観光協会・商店街・地域の情報サイト・新聞の記事、グルメ・予約サイトの店の基本情報(ジャンル・メニューの名前・席・設備・営業の形)。
- 使ってはいけないもの: 口コミ・評価・点数・ランキング・料金・価格、ほかのサイトの文の書き写し(事実だけ拾い、文は自分で書く)。
- facts の source には、実際に開いたページの URL を入れ、quote にはそのページの文字をそのまま入れます(あとで機械がそのページを開いて照合します)。
- WebSearch と WebFetch は合わせて ${maxWeb} 回までにします。事実が少なければ、そのぶん短い記事にします(POINT などの数は事実がある分だけ。足りない所は水増しせず空にする)。それでも書ける事実が店名・住所・営業時間しか無いときだけ、失敗の出口で終えます。
`;

let ok = 0;
let ng = 0;
async function next() {
  for (;;) {
    if (spent >= budget) { console.log(`[${t()}] 予算 $${budget} に達したので止めます(使った額 $${spent.toFixed(2)})`); return null; }
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
    // 使う量を減らす: 写真は一覧画像 1 枚で見せる・Web の道具は渡さない(材料は作業フォルダにそろっている)
    try { execFileSync("python3", [abs("automation/v2/contact-sheet.py"), work]); } catch {}
    const sheet = path.join(work, "sheet.jpg");
    const saving = existsSync(sheet)
      ? `# 🚨 使う量を減らす決まり(下のどの決まりより優先)
${research ? RESEARCH : "- 道具は Read と Write だけです。Web 検索・Web の取得はできません。材料のフォルダのファイルだけで書きます。\n"}- 写真は ${sheet} (候補をすべて番号つきで並べた一覧画像)を 1 回だけ Read して判断します。個別の cand/*.jpg は開きません。一覧で見分けられない写真は使いません。
- 材料のファイルは、1 回の手番でまとめて(同時に)Read します。同じファイルを読み直しません。machinowa-article-spec.md など、材料のフォルダの外のファイルは読みません(必要な決まりはこの指示文にそろっています)。
- 結果の JSON を書いたら、読み直しや確認はせず、すぐ「COMPLETED」で終えます。

`
      : "";
    const prompt = saving + readFileSync(path.join(work, "prompt.md"), "utf8");
    console.log(`[${t()}] ▶ ${key}`);
    const c = await runClaude({ prompt, tools: research ? "Read,Write,WebSearch,WebFetch" : "Read,Write", addDirs: [work, abs("agent-teams/decisions")] });
    spent += c.costUsd || 0;
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
console.log(`[${t()}] 結果: 書けた ${ok} / 書けなかった ${ng} / 使った額 $${spent.toFixed(2)}`);
