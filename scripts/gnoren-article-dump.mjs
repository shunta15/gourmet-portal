// 確認用: 全記事(公開 + 限定公開)について buildArticleVM(lib/portal/gnoren/article.ts)を回し、
// VM の JSON と集計を reports/ に書く。Supabase は読むだけ(書き込みなし)。
// 使い方: node scripts/gnoren-article-dump.mjs   (.env.local は中身を表示せず読み込む)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { createJiti } from "jiti";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const OUT = "/Users/shunta/claude/reports/machinowa-design/グルメ_本番化_2026-11-02";
const VM_DIR = `${OUT}/article-vm`;

// .env.local を process.env へ(表示しない)
if (existsSync(`${ROOT}/.env.local`)) {
  for (const line of readFileSync(`${ROOT}/.env.local`, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

// "server-only" は Next の外では解決できないので、空のモジュールに差し替える(環境変数 GN_SERVER_ONLY_STUB でパスを渡す。無ければ data: URL 相当の一時ファイルを作る)
import { tmpdir } from "node:os";
const stub = process.env.GN_SERVER_ONLY_STUB || (() => { const p = `${tmpdir()}/gn-server-only-stub.cjs`; writeFileSync(p, "module.exports = {};"); return p; })();
const jiti = createJiti(import.meta.url, { alias: { "@": ROOT, "server-only": stub }, interopDefault: true });
const { buildArticleVM } = await jiti.import(`${ROOT}/lib/portal/gnoren/article.ts`);
const { getFeatureArticleById, getAllFeatureArticleIds } = await jiti.import(`${ROOT}/lib/db/features.ts`);
const { UNLISTED_FEATURE_IDS } = await jiti.import(`${ROOT}/lib/unlisted.ts`);

const ids = [...new Set([...(await getAllFeatureArticleIds()), ...UNLISTED_FEATURE_IDS])];
console.log("ids:", ids.length, "(unlisted", UNLISTED_FEATURE_IDS.length + ")");

rmSync(VM_DIR, { recursive: true, force: true });
mkdirSync(VM_DIR, { recursive: true });

const safe = (id) => id.replace(/[\/\\:*?"<>|\0]/g, "_").slice(0, 120);
const vms = [];
const failures = [];
let next = 0;
async function worker() {
  while (next < ids.length) {
    const id = ids[next++];
    try {
      const a = await getFeatureArticleById(id);
      if (!a) { failures.push({ id, error: "article null" }); continue; }
      const vm = await buildArticleVM(a);
      vms.push(vm);
      writeFileSync(`${VM_DIR}/${safe(id)}.json`, JSON.stringify(vm, null, 2));
    } catch (e) {
      failures.push({ id, error: String(e?.stack || e).slice(0, 300) });
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

// ───── 集計 ─────
const KINDS = ["single", "roundup", "walk"];
const dist = (arr, unitKey = "章", unitVal = "本") => {
  const m = {};
  for (const n of arr) m[n] = (m[n] || 0) + 1;
  return Object.keys(m).sort((a, b) => a - b).map((k) => `${k}${unitKey}: ${m[k]}${unitVal}`).join(" / ") || "-";
};
const lines = [];
lines.push(`# 特集記事ビュー(GnArticleVM)変換の集計`);
lines.push(``);
lines.push(`- 対象: ${ids.length} 本(getAllFeatureArticleIds + 限定公開 ${UNLISTED_FEATURE_IDS.length})。変換できた: ${vms.length} 本。失敗/空: ${failures.length} 本`);
if (failures.length) for (const f of failures) lines.push(`  - 失敗 ${f.id}: ${f.error.split("\n")[0]}`);
lines.push(``);
lines.push(`## 種類別`);
lines.push(`| 種類 | 本数 | 章数の分布 | 写真 0 枚の章 | 章の総数 | 写真の総数 | hero 無し | shop 無し | quote 有り | closing 有り | related 0 本 |`);
lines.push(`|---|---|---|---|---|---|---|---|---|---|---|`);
const byKind = {};
for (const k of KINDS) {
  const v = vms.filter((x) => x.kind === k);
  byKind[k] = v;
  const chs = v.flatMap((x) => x.chapters);
  lines.push(
    `| ${k} | ${v.length} | ${dist(v.map((x) => x.chapters.length))} | ${chs.filter((c) => c.photos.length === 0).length} | ${chs.length} | ${chs.reduce((n, c) => n + c.photos.length, 0)} | ${v.filter((x) => !x.hero).length} | ${k === "single" ? v.filter((x) => !x.shop).length : "-"} | ${v.filter((x) => x.quote).length} | ${v.filter((x) => x.closing).length} | ${v.filter((x) => x.related.length === 0).length} |`,
  );
}
lines.push(``);
const noPhotoArticles = vms.filter((x) => !x.hero && x.chapters.every((c) => c.photos.length === 0));
lines.push(`## 写真が 1 枚も出ない記事(hero 無し かつ 全章 0 枚): ${noPhotoArticles.length} 本`);
for (const x of noPhotoArticles) lines.push(`- ${x.id} (${x.kind})`);
lines.push(``);
lines.push(`## hero 無しの記事: ${vms.filter((x) => !x.hero).length} 本`);
for (const x of vms.filter((x) => !x.hero)) lines.push(`- ${x.id} (${x.kind}, 章の写真 ${x.chapters.reduce((n, c) => n + c.photos.length, 0)} 枚)`);
lines.push(``);
lines.push(`## 店 1 軒の記事で shop 無し(対の店が引けない): ${byKind.single.filter((x) => !x.shop).length} 本`);
for (const x of byKind.single.filter((x) => !x.shop)) lines.push(`- ${x.id}`);
lines.push(``);
lines.push(`## shop.info の行数(店 1 軒の記事・shop 有り)`);
lines.push(dist(byKind.single.filter((x) => x.shop).map((x) => x.shop.info.length), "行", "本"));
lines.push(``);
lines.push(`## chapter.shop.info の行数(まとめ・街歩き)`);
for (const k of ["roundup", "walk"]) {
  lines.push(`- ${k}: ${dist(byKind[k].flatMap((x) => x.chapters.map((c) => c.shop?.info.length ?? 0)), "行", "章")}`);
}
lines.push(``);
lines.push(`## 写真の枚数の分布(章ごと)`);
for (const k of KINDS) {
  lines.push(`- ${k}: ${dist(byKind[k].flatMap((x) => x.chapters.map((c) => c.photos.length)), "枚", "章")}`);
}
lines.push(``);
const noteCnt = byKind.single.flatMap((x) => x.chapters).filter((c) => c.note).length;
lines.push(`## メモ紙(note)がある章(店 1 軒): ${noteCnt} / ${byKind.single.flatMap((x) => x.chapters).length}`);
lines.push(`## label が空の章: ${vms.flatMap((x) => x.chapters).filter((c) => !c.label).length}`);
lines.push(`## body が空の章: ${vms.flatMap((x) => x.chapters).filter((c) => c.body.length === 0).length}`);
lines.push(`## chapter.shop.href がある章(roundup): ${byKind.roundup.flatMap((x) => x.chapters).filter((c) => c.shop?.href).length}`);
lines.push(``);

// ───── 禁止語の検査 ─────
const text = vms.map((x) => JSON.stringify(x)).join("\n");
const BANNED = ["あかり食堂", "風待ち", "佐藤 健一", "1,380", "03-1234-5678", "マチノワ市", "2024.", "駅周辺", "中心街", "東エリア", "布越し", "あたたかな食卓", "今、読みたい", "準備中", "四季の味 たなか", "公式サイトによると", "その他", "No.1", "★", "☆", "口コミ"];
lines.push(`## 禁止語の検査(VM の JSON 全体)`);
for (const w of BANNED) {
  const hits = vms.filter((x) => JSON.stringify(x).includes(w));
  lines.push(`- 「${w}」: ${hits.length} 本${hits.length ? " → " + hits.slice(0, 8).map((x) => x.id).join(", ") : ""}`);
}
// purpose(内部の指示文。「〜について書く」で終わる文)
const purposeHits = [];
const purposeSet = new Set();
{
  const { FEATURE_ARTICLES, UNLISTED_FEATURE_ARTICLES } = await jiti.import(`${ROOT}/lib/data.ts`);
  for (const a of [...Object.values(FEATURE_ARTICLES), ...Object.values(UNLISTED_FEATURE_ARTICLES)]) for (const r of a.ranking) if (r.purpose) purposeSet.add(r.purpose);
}
for (const x of vms) {
  const j = JSON.stringify(x);
  if (/について書く[。"]/.test(j)) purposeHits.push(x.id + " (について書く)");
  for (const p of purposeSet) if (p.length >= 14 && j.includes(p)) { purposeHits.push(x.id + " (purpose 一致: " + p.slice(0, 30) + ")"); break; }
}
lines.push(`- 「〜について書く」で終わる文 / purpose 一致: ${purposeHits.length} 本${purposeHits.length ? " → " + purposeHits.slice(0, 10).join(", ") : ""}`);
lines.push(`  (purpose を持つ項目の種類: ${purposeSet.size})`);
// 値段
const priceRows = [];
for (const x of vms) {
  for (const c of x.chapters) for (const [k, v] of c.shop?.info ?? []) if (/予算|料金|価格|入館料|入場料|[¥￥]/.test(k + v)) priceRows.push(`${x.id} / ${k}: ${v}`);
  for (const [k, v] of x.shop?.info ?? []) if (/予算|料金|価格|[¥￥]/.test(k + v)) priceRows.push(`${x.id} / shop ${k}: ${v}`);
}
lines.push(`- 値段らしき info 行(キー or 値に 予算/料金/価格/入館料/入場料/¥): ${priceRows.length} 行`);
for (const r of priceRows.slice(0, 15)) lines.push(`  - ${r}`);
lines.push(``);

writeFileSync(`${OUT}/article-vm-summary.md`, lines.join("\n"));
console.log(lines.join("\n"));
