#!/usr/bin/env node
/**
 * write.mjs — 記事の自動作成(新) 第2段: 記事を作る(無人・途中から再開できる)
 *
 * 第1段(automation/v2/out/verify-<日付>.json。Google マップで実在確認済みの店)から店を選び、1 店ずつ:
 *   ① Google マップで基本情報・営業時間・写真を取る(Playwright。店と店の間は 6〜10 秒。CAPTCHA・確認ページが出たら、その場で全体を止める)
 *   ② 公式サイト(SNS・掲載ポータルは除く)の文字と写真を取る
 *   ③ 写真の候補を整える(読めない・小さい・同じ絵を落とす)
 *   ④ `claude -p --model sonnet` に、材料・写真を見て書かせる(結果は決まった JSON ファイル 1 つ。commit・push・デプロイ・シートへの書き込みはさせない)
 *   ⑤ 機械で検査する(文の型・禁止語・料金・評価・出どころの言い回し・形・事実の裏取り)。引っかかったら 1 回だけ書き直させる。それでも駄目なら失敗として記録
 *   ⑥ 合格した店だけ、業種ごとの形でデータに入れて、生成データを作り直す
 *   ⑦ 結果を out/write-<日付>.json と out/write-<日付>.md に残す
 *
 * 使い方(1 行):
 *   node automation/v2/write.mjs --from-row 80 --limit 2            # 選んで 2 店だけ回す
 *   node automation/v2/write.mjs --only-row 130,140                  # 行を指定
 *   node automation/v2/write.mjs --from-row 80 --dry                 # 選ぶだけ(何も取らない・書かない)
 *   node automation/v2/write.mjs --only-row 130 --prepare-only       # ①〜③と指示文づくりまで(claude は呼ばない)
 *   node automation/v2/write.mjs --only-row 130 --skip-claude        # 作業フォルダの result.json を使って ⑤〜⑦ を回す
 *   --verify <file>   第1段の結果(既定: out/ の最新の verify-*.json)
 *   --vertical <業種> 業種で絞る(例: グルメ)

 *   --reintegrate     この仕組みで作ったグルメ以外の店を、作り直した結果で組み込み直す(店 ID は変わらない)
 *   --keep-going      失敗した店があっても次へ(既定でそうする)。CAPTCHA・認証切れ・ネット断だけは全体を止める
 *
 * 作る店の条件: row >= --from-row(既定 80)・第1段の verdict が「確認済み」・業種が「くらし」「要確認」でない。
 * すでにある店は作らない(記事 ID・店のキーは NFC で完全一致。cid は既存の店の台帳と照合。中間一致は使わない)。
 * 再開: 作業フォルダ automation/v2/work/<キー>/ に段ごとの結果が残る。同じコマンドをもう一度回すと、済んだ段は飛ばす(--redo <キー> でやり直し)。
 * 認証: claude -p は、端末で `claude setup-token` して作った長期トークンを CLAUDE_CODE_OAUTH_TOKEN に入れて渡す(ファイルには書かない)。
 *       切れていたら、店に触る前に止めて「環境のエラー」として記録する(店のエラーにしない)。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runClaude, preflight, AUTH_HELP } from "./lib/claude.mjs";
import { checkSentences, checkShape, verifyFacts } from "./lib/check.mjs";
import { classifySentence } from "../../scripts/check-article-sentences.mjs";
import { integrateGourmet, baselineFixups } from "./lib/integrate-gourmet.mjs";
import { integrateVertical } from "./lib/integrate-vertical.mjs";
import { CaptchaError, MapsSession } from "./lib/maps.mjs";
import { collectPhotos } from "./lib/photos.mjs";
import { buildPrompt, pickGourmetExample } from "./lib/prompt.mjs";
import { classifyOfficial, readSite } from "./lib/site.mjs";
import {
  OUT_DIR, REPO, SKIP_VERTICALS, VERTICAL_EN, WORK_DIR, abs, articleIdOf, ensureDir, jitter, keyOf, listDir, log, nfc, nowIso,
  parseArgs, readJson, sleep, today, writeJson,
} from "./lib/util.mjs";

const args = parseArgs(process.argv.slice(2));
const FROM_ROW = Number(args["from-row"] ?? 80);
const ONLY_ROWS = args["only-row"] ? String(args["only-row"]).split(",").map((x) => Number(x.trim())) : null;
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const DATE = args.date || today();
const TAB = "トリニティアポ";
const PHOTO_KINDS = new Set(["exterior", "room", "bath", "meal", "common", "view"]);
const REPORT_JSON = path.join(OUT_DIR, `write-${DATE}.json`);
const REPORT_MD = path.join(OUT_DIR, `write-${DATE}.md`);

// ------------------------------------------------------------------ 選ぶ
function latestVerify() {
  const f = listDir(OUT_DIR).filter((x) => /^verify-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  if (!f) throw new Error("out/ に verify-<日付>.json がありません(第1段を先に)");
  return path.join(OUT_DIR, f);
}

/** 既存の記事 ID(NFC)。グルメの URL(/feature/<ID>)と同じ空間にある特集の ID すべて */
function existingArticleIds() {
  const ids = new Set();
  const dir = abs("lib");
  for (const f of readdirSync(dir)) {
    if (!/\.ts$/.test(f) || !/(eatures|data|Features)/i.test(f)) continue;
    const src = readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/^\s*(?:["']?id["']?)\s*:\s*"([^"\n]+)"\s*,/gm)) ids.add(nfc(m[1]));
  }
  return ids;
}

/** 既存の店の cid(グルメ: stores500/gbp・map.json、グルメ以外: vertical-stores の ids.json と gbp) */
function existingCids() {
  const cids = new Map();
  const add = (cid, where) => cid && cids.set(String(cid), where);
  const cidOf = (u) => /[?&]cid=(\d+)/.exec(u || "")?.[1];
  for (const f of listDir(abs("automation/stores500/gbp"))) {
    try { add(cidOf(readJson(abs("automation/stores500/gbp", f)).gbpUrl), `グルメの店(${f})`); } catch { /* 読めないファイルは飛ばす */ }
  }
  for (const m of readJson(abs("automation/stores500/map.json"), [])) add(cidOf(m.mapsUrl), `グルメ map.json(${m.articleId})`);
  const ids = readJson(abs("automation/vertical-stores/ids.json"), {});
  for (const [v, m] of Object.entries(ids)) if (m && typeof m === "object") for (const [cid, id] of Object.entries(m)) add(cid, `${v}の店 ${id}`);
  for (const f of listDir(abs("automation/vertical-stores/gbp"))) {
    try { add(cidOf(readJson(abs("automation/vertical-stores/gbp", f)).place?.gbpUrl), `vertical-stores/gbp/${f}`); } catch { /* 同上 */ }
  }
  return cids;
}

function selectStores(verify) {
  const arts = existingArticleIds();
  const cids = existingCids();
  const picked = [];
  const skipped = [];
  for (const r of Object.values(verify.results)) {
    if (r.tab !== TAB) continue;
    if (ONLY_ROWS ? !ONLY_ROWS.includes(r.row) : r.row < FROM_ROW) continue;
    const why = (reason) => skipped.push({ row: r.row, name: r.name, vertical: r.vertical, reason });
    if (r.verdict !== "確認済み") { why(`第1段の判定が「${r.verdict}」`); continue; }
    if (SKIP_VERTICALS.has(r.vertical) || !VERTICAL_EN[r.vertical]) { why(`業種が「${r.vertical}」(作らない)`); continue; }
    if (args.vertical && r.vertical !== args.vertical) continue;
    const own = cids.get(String(r.cid)) === `vertical-stores/gbp/${keyOf(VERTICAL_EN[r.vertical], r.row)}.json`;
    if (cids.has(String(r.cid)) && !(args.reintegrate && own)) { why(`既にある店(cid 一致: ${cids.get(String(r.cid))})`); continue; }
    const vEn = VERTICAL_EN[r.vertical];
    const key = keyOf(vEn, r.row);
    const store = {
      key, tab: r.tab, row: r.row, name: r.name, vertical: r.vertical, verticalEn: vEn, industryRaw: r.industryRaw,
      sheetUrl: r.sheetUrl, urlKind: r.urlKind, cid: String(r.cid), mapName: r.mapName, mapAddress: r.mapAddress, mapPhone: r.mapPhone,
      mapUrl: r.mapUrl, website: r.website, reason: r.reason,
    };
    if (vEn === "gourmet") {
      store.articleId = articleIdOf(r.mapName || r.name);
      if (!store.articleId) { why("記事 ID を作れない(店名が空)"); continue; }
      if (arts.has(nfc(store.articleId))) { why(`記事 ID「${store.articleId}」が既にある(完全一致)`); continue; }
      const dup = picked.find((p) => p.articleId && nfc(p.articleId) === nfc(store.articleId));
      if (dup) { why(`同じ記事 ID「${store.articleId}」の店(行 ${dup.row})が先にある`); continue; }
    }
    picked.push(store);
  }
  picked.sort((a, b) => a.row - b.row);
  return { picked: picked.slice(0, LIMIT), skipped, totalMatched: picked.length };
}

// ------------------------------------------------------------------ 結果の記録
let report = existsSync(REPORT_JSON) ? readJson(REPORT_JSON) : { meta: { date: DATE, startedAt: nowIso() }, environment: null, results: {} };
const save = () => {
  report.meta.updatedAt = nowIso();
  writeJson(REPORT_JSON, report);
  writeFileSync(REPORT_MD, renderMd(report));
};
function renderMd(rep) {
  const rows = Object.values(rep.results).sort((a, b) => a.row - b.row);
  const L = [];
  L.push(`# 記事の自動作成(新) 第2段の結果 ${rep.meta.date}`, "");
  L.push(`更新: ${rep.meta.updatedAt}`, "");
  if (rep.environment) L.push(`**環境のエラー(全体を止めた)**: ${rep.environment.kind} — ${rep.environment.message}`, "");
  const ok = rows.filter((r) => r.status === "成功").length;
  L.push(`成功 ${ok} / 失敗 ${rows.filter((r) => r.status === "失敗").length} / 未了 ${rows.filter((r) => !["成功", "失敗"].includes(r.status)).length}`, "");
  L.push("| 行 | 店名 | 業種 | 結果 | 写真(候補→使用→空き枠) | 記事ID / 店ID | 時間(秒) | 理由・メモ |", "|---|---|---|---|---|---|---|---|");
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  for (const r of rows) {
    const ph = r.photos ? `${r.photos.candidates}→${r.photos.used}→${r.photos.emptyFrames ?? "-"}` : "-";
    const ids = [r.articleId, r.placeId || r.storeId].filter(Boolean).join(" / ") || "-";
    L.push(`| ${r.row} | ${esc(r.name)} | ${r.vertical} | ${r.status}${r.stage && r.status !== "成功" ? `(${r.stage})` : ""} | ${ph} | ${esc(ids)} | ${r.seconds?.total ?? "-"}(claude ${r.seconds?.claude ?? "-"}) | ${esc(r.reason || r.memo || "")} |`);
  }
  L.push("", "## 店ごとの URL(ローカル)", "");
  for (const r of rows.filter((x) => x.status === "成功")) L.push(`- ${r.name}: ${Object.values(r.urls || {}).filter(Boolean).map((u) => `http://localhost:3000${encodeURI(u)}`).join(" , ")}`);
  return L.join("\n") + "\n";
}

// ------------------------------------------------------------------ 1 店
class EnvironmentError extends Error {
  constructor(kind, message) { super(message); this.kind = kind; }
}

const AUTH_RE = /authenticate|OAuth|not logged in|credential|please run \/login|invalid api key|401/i;
const NET_RE = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|getaddrinfo|network|fetch failed|overloaded|503|529/i;

const state = (work) => readJson(path.join(work, "state.json"), {});
const setState = (work, patch) => writeJson(path.join(work, "state.json"), { ...state(work), ...patch, updatedAt: nowIso() });

function hoursText(h) {
  if (!h) return "(Google マップに営業時間の表なし)";
  return Object.entries(h).map(([d, v]) => `${d}: ${v}`).join(" / ");
}

async function processStore(store, ctx) {
  const t0 = Date.now();
  const work = path.join(WORK_DIR, store.key);
  if (args.redo && String(args.redo).split(",").includes(store.key)) rmSync(work, { recursive: true, force: true });
  ensureDir(work);
  const rec = (report.results[store.key] ??= { key: store.key, row: store.row, name: store.name, vertical: store.vertical });
  Object.assign(rec, { articleId: store.articleId, status: "処理中", stage: "start", startedAt: rec.startedAt || nowIso() });
  rec.seconds = rec.seconds || {};
  const fail = (stage, reason, extra = {}) => {
    Object.assign(rec, { status: "失敗", stage, reason, ...extra });
    rec.seconds.total = Math.round((Date.now() - t0) / 1000) + (rec.seconds.prev || 0);
    setState(work, { stage: "failed", failedAt: stage, reason });
    save();
    log(`✗ ${store.key} ${store.name}: ${stage} — ${reason}`);
    return rec;
  };
  if (state(work).stage === "integrated") {
    log(`= ${store.key} は組み込み済み(飛ばす)`);
    return rec;
  }
  writeJson(path.join(work, "selected.json"), store);

  // ---- ① Google マップ(基本情報・営業時間・写真の URL)
  const infoFile = path.join(work, "info.json");
  if (!existsSync(infoFile)) {
    rec.stage = "maps";
    save();
    if (ctx.mapsUsed) await sleep(jitter(6000, 10000));
    ctx.mapsUsed = true;
    log(`① Google マップ: ${store.name}`);
    try {
      const got = await ctx.maps.fetchStore(store.mapUrl, store.cid);
      writeJson(infoFile, got);
    } catch (e) {
      if (e instanceof CaptchaError) throw new EnvironmentError("captcha", `${store.key}: ${e.message}`);
      return fail("maps", `Google マップを読めなかった: ${e.message}`);
    }
  }
  const { info, photoUrls, notes: mapNotes } = readJson(infoFile);
  store.info = info;
  if (info.status) return fail("maps", `Google マップに閉業・休業の表示がある(${info.status})`);
  if (!info.address) return fail("maps", "Google マップの住所を読めなかった");
  // 住所の都道府県が第1段と一致すること(店の取り違えを作らない)
  const pref = (s) => /^(?:日本、)?〒?[\d-]*\s*(北海道|東京都|京都府|大阪府|.{2,3}県)/.exec(String(s).normalize("NFKC"))?.[1];
  if (pref(info.address) && pref(store.mapAddress) && pref(info.address) !== pref(store.mapAddress)) return fail("maps", `都道府県が第1段と違う(${pref(info.address)} / ${pref(store.mapAddress)})`);
  store.cityName = (/^(?:日本、)?〒?[\d-]*\s*(?:北海道|東京都|京都府|大阪府|.{2,3}県)(.+?[市区町村])/.exec(String(info.address).normalize("NFKC")) || [])[1];

  // ---- ② 公式サイト
  const siteDir = path.join(work, "site");
  const siteFile = path.join(work, "site.json");
  if (!existsSync(siteFile)) {
    rec.stage = "site";
    save();
    log("② 公式サイト");
    const s = await readSite(info.website || store.website, { log });
    ensureDir(siteDir);
    s.pages.forEach((p, i) => writeFileSync(path.join(siteDir, `page${i + 1}.txt`), `URL: ${p.url}\nTITLE: ${p.title}\n\n${p.text}\n`));
    writeJson(siteFile, { official: s.official, pages: s.pages.map((p) => ({ url: p.url, title: p.title, chars: p.text.length })), images: s.images, notes: s.notes });
  }
  const site = readJson(siteFile);
  store.officialUrl = site.official?.url || null;

  // ---- ③ 写真の候補
  const manifestFile = path.join(work, "cand", "manifest.json");
  if (!existsSync(manifestFile)) {
    rec.stage = "photos";
    save();
    log(`③ 写真の候補(Google マップ ${photoUrls.length} 件・公式サイト ${site.images.length} 件)`);
    const got = await collectPhotos({ dir: work, mapsUrls: photoUrls, siteImages: site.images, log });
    writeJson(manifestFile, { items: got.items.map(({ hash, ...x }) => x), rejects: got.rejects });
  }
  const manifestAll = readJson(manifestFile);
  const manifest = manifestAll.items;
  rec.photos = { candidates: manifest.length, maps: manifest.filter((m) => m.source === "maps").length, official: manifest.filter((m) => m.source === "official").length, rejectedByMachine: manifestAll.rejects.length };

  // store.json(書き手に渡す材料。シートの備考・個人情報は入れない)
  writeJson(path.join(work, "store.json"), {
    key: store.key, vertical: store.vertical, 店名: info.name, 住所: info.address, 電話: info.phone, cid: store.cid, 地図URL: info.gbpUrl,
    業種の表示: info.category, 営業時間: info.hours, 営業時間の文: hoursText(info.hours), 緯度: info.lat, 経度: info.lng,
    公式サイト: store.officialUrl, 公式サイトの扱い: site.official?.reason, 市区町村: store.cityName,
  });
  if (manifest.length === 0) {
    rec.memo = "写真の候補が 0 枚(Google マップ・公式サイトとも取れなかった)。写真なしで続ける";
  }

  // ---- ④ 指示文 → claude
  const resultFile = path.join(work, "result.json");
  const addDirs = [work, abs("agent-teams/decisions")];
  const prep = async (rewriteNote) => {
    if (store.verticalEn === "gourmet") {
      const mod = await import(pathToFileURL(abs("lib/teleapo-features.ts")).href + `?t=${Date.now()}`);
      await pickGourmetExample(work, { classify: classifySentence, features: mod.TELEAPO_FEATURE_ARTICLES });
    }
    return buildPrompt({ store, work, outFile: resultFile, rewriteNote });
  };
  if (!existsSync(resultFile) && !args["skip-claude"]) {
    rec.stage = "prompt";
    const prompt = await prep();
    if (args["prepare-only"]) {
      rec.status = "準備のみ";
      rec.stage = "prepared";
      rec.seconds.total = Math.round((Date.now() - t0) / 1000);
      save();
      log(`• ${store.key}: 指示文まで作った(${path.join(work, "prompt.md")})`);
      return rec;
    }
    rec.stage = "claude";
    save();
    log(`④ claude -p --model sonnet(${store.key})`);
    const c = await runClaude({ prompt, addDirs });
    rec.seconds.claude = Math.round(c.durationMs / 1000);
    rec.claude = { ok: c.ok, costUsd: c.costUsd, turns: c.turns, tail: c.text.slice(-160) };
    writeFileSync(path.join(work, "claude-1.log"), `${c.text}\n\n--- stderr ---\n${c.stderr}\n`);
    if (!c.ok || !existsSync(resultFile)) {
      const msg = `${c.text} ${c.stderr}`;
      if (AUTH_RE.test(msg) && !existsSync(resultFile)) throw new EnvironmentError("auth", `${AUTH_HELP}(${msg.slice(0, 120)})`);
      if (NET_RE.test(msg) && !existsSync(resultFile)) throw new EnvironmentError("net", msg.slice(0, 160));
      return fail("claude", c.timedOut ? "claude が時間切れ" : `claude が結果ファイルを作らずに終わった(${msg.trim().slice(-160)})`);
    }
  } else if (args["prepare-only"]) {
    rec.status = "準備のみ";
    save();
    return rec;
  }
  if (!existsSync(resultFile)) return fail("claude", "result.json が無い(--skip-claude)");

  // ---- ⑤ 機械の検査(1 回だけ書き直させる)
  const manifestIds = manifest.map((m) => m.id);
  const storeText = readFileSync(path.join(work, "store.json"), "utf8");
  const sitePages = site.pages.map((p, i) => ({ url: p.url, text: readFileSync(path.join(siteDir, `page${i + 1}.txt`), "utf8") }));
  const inspect = async () => {
    let result;
    try {
      result = readJson(resultFile);
    } catch (e) {
      return { result: null, problems: [`result.json が JSON として読めない: ${e.message}`], sentences: [], verified: null };
    }
    if (result.status === "failed") return { result, failedByWriter: result.reason || "(理由なし)", problems: [], sentences: [], verified: null };
    // 写真の種類は決まった値だけ
    for (const p of result.photos || []) if (p.kind && !PHOTO_KINDS.has(p.kind)) delete p.kind;
    const shape = checkShape(result, { vEn: store.verticalEn, manifestIds });
    const sentences = shape.length ? [] : checkSentences(result);
    let verified = null;
    const problems = [...shape];
    if (!shape.length) {
      verified = await verifyFacts(result.facts, { info, storeText, sitePages });
      const bad = verified.unverified.length;
      if (verified.verified < 4 || bad / Math.max(1, verified.total) > 0.3) problems.push(`facts の裏取りに通ったのが ${verified.verified}/${verified.total} 件(通らない quote が多い)`);
    }
    return { result, problems, sentences, verified };
  };
  const noteOf = (r) => {
    const L = [];
    for (const p of r.problems) L.push(`- 形・事実: ${p}`);
    for (const s of r.sentences.slice(0, 30)) L.push(`- ${s.path} の文「${s.sentence.slice(0, 80)}」→ ${s.type}: ${s.word}`);
    for (const u of (r.verified?.unverified || []).slice(0, 12)) L.push(`- facts[${u.index}] の quote「${String(u.quote).slice(0, 40)}」は ${u.reason}(source: ${u.source})。quote を出どころの文字そのままに直すか、その事実を使った文ごと取り除く`);
    return L.join("\n");
  };
  rec.stage = "check";
  let r = await inspect();
  if (r.failedByWriter) return fail("claude", `書き手が失敗の出口で終了: ${r.failedByWriter}`);
  let rewrote = false;
  const unverifiedRatio = (x) => (x.verified ? x.verified.unverified.length / Math.max(1, x.verified.total) : 0);
  if (r.problems.length || r.sentences.length || unverifiedRatio(r) >= 0.1) {
    const note = noteOf(r);
    if (args["skip-claude"]) {
      log(`  検査で ${r.problems.length + r.sentences.length} 件(--skip-claude のため書き直しは呼ばない)`);
    } else {
      log(`⑤ 検査で ${r.problems.length + r.sentences.length} 件(裏取りに通らない facts ${r.verified?.unverified.length ?? 0} 件) → 書き直し(1 回)`);
      writeFileSync(path.join(work, "result.attempt1.json"), readFileSync(resultFile));
      const c2 = await runClaude({ prompt: await prep(note), addDirs });
      rec.seconds.claude = (rec.seconds.claude || 0) + Math.round(c2.durationMs / 1000);
      writeFileSync(path.join(work, "claude-2.log"), `${c2.text}\n\n--- stderr ---\n${c2.stderr}\n`);
      rewrote = true;
      if (!c2.ok && AUTH_RE.test(`${c2.text} ${c2.stderr}`)) throw new EnvironmentError("auth", AUTH_HELP);
      r = await inspect();
      if (r.failedByWriter) return fail("claude", `書き直しで書き手が失敗の出口で終了: ${r.failedByWriter}`);
    }
  }
  rec.check = { rewrote, shapeProblems: r.problems, sentenceProblems: r.sentences.length, facts: r.verified ? { total: r.verified.total, verified: r.verified.verified } : null };
  const hard = [...r.problems, ...r.sentences.map((s) => `${s.path}「${s.sentence.slice(0, 40)}」${s.type}:${s.word}`)];
  if (hard.length) return fail("check", `検査に通らない(${hard.length} 件${rewrote ? "・書き直し後も" : ""}): ${hard.slice(0, 4).join(" / ")}`, { checkDetail: hard.slice(0, 30) });
  if (r.verified?.unverified.length > 0) {
    // 少数の裏取りに通らない facts は、文には影響しない確認用の欄から外して続ける(件数は記録)
    rec.memo = `裏取りに通らない facts ${r.verified.unverified.length} 件は載せていない`;
  }

  // ---- ⑥ 組み込み
  if (args["no-integrate"]) {
    rec.status = "検査まで";
    rec.stage = "checked";
    save();
    return rec;
  }
  rec.stage = "integrate";
  save();
  log(`⑥ 組み込み(${store.vertical})`);
  const used = (r.result.photos || []).filter((p) => p.use).length;
  try {
    let done;
    if (store.verticalEn === "gourmet") {
      done = await integrateGourmet({ store, result: r.result, manifest, work, verified: r.verified, baseline: ctx.baseline, log });
      Object.assign(rec, { storeId: done.storeId, onePage: done.onePage, storeBuilt: done.storeBuilt, storeNote: done.storeExcludedReason });
    } else {
      done = await integrateVertical({ store, result: r.result, manifest, work, verified: r.verified, log });
      Object.assign(rec, { placeId: done.placeId, featureInGenerated: done.featureInGenerated, featureNote: done.featureSkipped });
    }
    rec.photos = { ...rec.photos, used: done.photosPlaced ?? used, emptyFrames: done.emptyFrames ?? done.emptyPointFrames ?? 0 };
    rec.urls = done.urls;
  } catch (e) {
    return fail("integrate", `データに入れられなかった(触ったファイルは元に戻した): ${e.message}`);
  }
  Object.assign(rec, { status: "成功", stage: "done", reason: undefined, finishedAt: nowIso() });
  rec.seconds.total = Math.round((Date.now() - t0) / 1000);
  setState(work, { stage: "integrated" });
  save();
  log(`✓ ${store.key} ${store.name}(${rec.seconds.total}秒)`);
  return rec;
}

// ------------------------------------------------------------------ 本体
async function main() {
  const verifyFile = args.verify ? path.resolve(args.verify) : latestVerify();
  const verify = readJson(verifyFile);
  const sel = selectStores(verify);
  log(`第1段の結果: ${path.basename(verifyFile)} / 条件に合う店 ${sel.totalMatched} 件 → 今回 ${sel.picked.length} 件`);
  const byV = {};
  for (const s of sel.picked) byV[s.vertical] = (byV[s.vertical] || 0) + 1;
  log(`  内訳: ${JSON.stringify(byV)}`);
  for (const s of sel.picked) log(`  行${s.row} ${s.vertical} ${s.name} → ${s.key}${s.articleId ? ` / 記事ID ${s.articleId}` : ""}`);
  if (sel.skipped.length) log(`  飛ばした店 ${sel.skipped.length} 件: ${sel.skipped.slice(0, 6).map((x) => `行${x.row}(${x.reason})`).join(" / ")}`);
  if (args.dry) return;
  if (sel.picked.length === 0) return;
  report.meta.verifyFile = path.relative(REPO, verifyFile);
  report.meta.args = process.argv.slice(2).join(" ");

  // 実行前の確認(認証切れ・ネット断なら、店に触る前に止める。店のエラーにはしない)
  if (!args["skip-claude"] && !args["prepare-only"]) {
    log("実行前の確認: claude -p(認証・ネット)");
    const pf = await preflight();
    if (!pf.ok) {
      report.environment = { kind: pf.kind, message: pf.message, at: nowIso() };
      save();
      console.error(`\n環境のエラー(${pf.kind}): ${pf.message}\n店には何も書いていません。`);
      process.exit(pf.kind === "auth" ? 11 : 10);
    }
    log(`  OK(${Math.round(pf.durationMs / 1000)}秒)`);
  }

  const ctx = { maps: new MapsSession(), mapsUsed: false, baseline: undefined };
  // グルメの店があるときだけ、main の時点の生成器のずれ(手で直した行)を調べる
  if (sel.picked.some((s) => s.verticalEn === "gourmet") && !args["prepare-only"] && !args["no-integrate"]) {
    ctx.baseline = baselineFixups();
    if (ctx.baseline === null) {
      console.error("lib/articleStores.ts が、生成器の出力と行数からして食い違っています。グルメの店は作れません(--vertical で他の業種だけを回してください)。");
      process.exit(12);
    }
    log(`生成器とコミット済みデータの既存のずれ: ${ctx.baseline.length} 行(元の文のまま保つ)`);
  }
  try {
    for (const store of sel.picked) {
      try {
        await processStore(store, ctx);
      } catch (e) {
        if (e instanceof EnvironmentError) {
          report.environment = { kind: e.kind, message: e.message, at: nowIso() };
          const rec = report.results[store.key];
          if (rec) Object.assign(rec, { status: "未了", stage: `環境のエラーで中断(${e.kind})`, reason: "店のエラーではない(環境)。同じコマンドで再開できる" });
          save();
          console.error(`\n環境のエラー(${e.kind}): ${e.message}\n全体を止めました(店のエラーとは記録していません。直したら同じコマンドで再開できます)。`);
          process.exitCode = e.kind === "captcha" ? 3 : e.kind === "auth" ? 11 : 10;
          return;
        }
        const rec = report.results[store.key];
        if (rec) Object.assign(rec, { status: "失敗", reason: `想定外のエラー: ${e.stack?.split("\n").slice(0, 2).join(" ")}` });
        save();
        log(`✗ ${store.key}: 想定外のエラー ${e.message}`);
      }
    }
  } finally {
    await ctx.maps.close();
  }
  save();
  const rows = Object.values(report.results);
  console.error(`\n結果: 成功 ${rows.filter((x) => x.status === "成功").length} / 失敗 ${rows.filter((x) => x.status === "失敗").length}  → ${path.relative(REPO, REPORT_MD)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
