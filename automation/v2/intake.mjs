#!/usr/bin/env node
/**
 * intake.mjs  —  記事の自動作成(新) 第1段: 読み込み → 候補 → 業種の振り分け(読むだけ)
 *
 * スプレッドシート 1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk を「読むだけ」(readonly スコープ)。
 *   Linkateアポ   : B=店舗名 C=電話 D=住所 E=GBP/マップURL F=業種 G=詰めOK日 (I=記事URL: 台帳を引く式)
 *   トリニティアポ : A=日時 B=店舗名 C=電話 D=URL E=業種 F=ステータス G=備考(住所なし) (H=記事URL)
 *   台帳           : Linkate記事台帳 / トリニティ記事台帳  (A=顧客管理ID/受付日時 B=店舗名 C=記事ID D=URL)
 *
 * 候補 = 台帳に「店名が完全一致(前後の空白を除く・NFC)」で載っていない店。中間一致は使わない。
 * 業種は vertical-map.json で付ける。決まらなければ「要確認」。
 * 備考(G/H列)は個人情報を含むので読まない・保存しない。
 *
 * 使い方:
 *   node automation/v2/intake.mjs                  → out/intake-<日付>.json を書き、件数を表示
 *   node automation/v2/intake.mjs --include-registered  → 台帳にある店も候補に含める(検証の動作確認用)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
export const OUT_DIR = path.join(HERE, "out");
export const SHEET_ID = "1ap-xd7DaW0dd8L11aoA7GAWltN0h7jGawyadtczwQgk";

export const TABS = {
  Linkateアポ: { ledger: "Linkate記事台帳", cols: { name: 1, phone: 2, address: 3, url: 4, industry: 5, date: 6 } },
  トリニティアポ: { ledger: "トリニティ記事台帳", cols: { date: 0, name: 1, phone: 2, url: 3, industry: 4, status: 5 } },
};

export const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const nfc = (s) => String(s ?? "").normalize("NFC").trim();

export function loadMap() {
  return JSON.parse(readFileSync(path.join(HERE, "vertical-map.json"), "utf8"));
}

/** 業種の振り分け。{vertical|null, source, reason} を返す。null は「要確認」 */
export function classify(tab, name, industryRaw, map = loadMap()) {
  const nm = nfc(name);
  const ind = String(industryRaw ?? "").normalize("NFKC").trim();
  const dec = map.storeDecisions.find((d) => d.tab === tab && nfc(d.name) === nm);
  if (dec) return { vertical: dec.vertical, source: "店ごとの決定", reason: dec.note || "" };

  for (const r of map.industryRules) {
    if (r.exact?.some((x) => x.normalize("NFKC") === ind)) return { vertical: r.vertical, source: "業種の欄", reason: `業種の欄「${ind}」` };
  }
  for (const r of map.industryRules) {
    if (r.prefix?.some((x) => ind && ind.startsWith(x.normalize("NFKC")))) return { vertical: r.vertical, source: "業種の欄", reason: `業種の欄「${ind}」` };
  }

  // 店名から(業種の欄が「その他」・空のときだけ)
  const hits = [];
  for (const r of map.nameRules) {
    if (!r.appliesWhenIndustry.some((x) => x.normalize("NFKC") === ind)) continue;
    const matched =
      r.nameContains?.find((w) => nm.includes(w)) ||
      (r.nameRegex || []).map((re) => nm.match(new RegExp(re, r.nameRegexFlags || ""))).find(Boolean)?.[0];
    if (matched) hits.push({ vertical: r.vertical, matched: String(matched).trim() });
  }
  const verts = [...new Set(hits.map((h) => h.vertical))];
  if (verts.length === 1) return { vertical: verts[0], source: "店名", reason: `業種の欄「${ind || "空"}」・店名に「${hits[0].matched}」` };
  if (verts.length > 1) return { vertical: null, source: "要確認", reason: `店名のルールが複数の業種に当たった(${hits.map((h) => `${h.matched}→${h.vertical}`).join(" / ")})` };
  return { vertical: null, source: "要確認", reason: `業種の欄「${ind || "空"}」を振り分け表のルールで決められない` };
}

export function urlKind(u) {
  u = String(u ?? "").trim();
  if (!u) return "empty";
  if (!/^https?:\/\//i.test(u)) return "garbage";
  if (/^https?:\/\/share\.google\//.test(u)) return "share";
  if (/maps\.app\.goo\.gl/.test(u)) return "maps.app";
  if (/^https?:\/\/(x\.gd|bit\.ly|t\.co|goo\.gl|tinyurl\.com|is\.gd|lin\.ee|ow\.ly)\//i.test(u)) return "short";
  if (/(google\.[a-z.]+\/maps\?cid=|maps\.google\.[a-z.]+\/\?cid=|[?&]cid=\d+)/.test(u) && /google\./.test(u)) return "cid";
  if (/google\.[a-z.]+\/maps\/place/.test(u)) return "place";
  if (/google\.[a-z.]+\/search/.test(u)) return "search";
  return "official";
}

export async function readSheets() {
  const { google } = await import(pathToFileURL(path.join(REPO, "node_modules/googleapis/build/src/index.js")).href);
  const credentials = JSON.parse(readFileSync(path.join(REPO, "automation/secrets/sa.json"), "utf8"));
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
  const out = {};
  for (const [tab, def] of Object.entries(TABS)) {
    // 備考(G/H以降)は読まない。アポタブは A:F(トリニティ) / A:G(Linkate) まで
    const apoRange = tab === "Linkateアポ" ? "A1:G3000" : "A1:F3000";
    const [apo, led] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `'${tab}'!${apoRange}` }),
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `'${def.ledger}'!A1:D3000` }),
    ]);
    out[tab] = { rows: apo.data.values || [], ledger: led.data.values || [] };
  }
  return out;
}

export function buildCandidates(raw, { includeRegistered = false } = {}) {
  const map = loadMap();
  const result = { tabs: {}, candidates: [], excluded: [], registered: {} };
  for (const [tab, def] of Object.entries(TABS)) {
    const { rows, ledger } = raw[tab];
    const ledNames = new Set(ledger.slice(1).map((r) => nfc(r[1])).filter(Boolean));
    const c = def.cols;
    const stat = { rows: 0, registered: 0, excluded: 0, candidates: 0, duplicateNames: [] };
    const seen = new Set();
    rows.slice(1).forEach((r, i) => {
      const rowNo = i + 2;
      const name = nfc(r[c.name]);
      if (!name) return; // 空行
      stat.rows++;
      const excl = map.excluded.find((e) => e.tab === tab && nfc(e.name) === name);
      if (excl) {
        stat.excluded++;
        result.excluded.push({ tab, row: rowNo, name, reason: excl.reason });
        return;
      }
      if (ledNames.has(name)) {
        stat.registered++;
        if (!includeRegistered) return;
      }
      if (seen.has(name)) stat.duplicateNames.push(name);
      seen.add(name);
      const industryRaw = String(r[c.industry] ?? "").trim();
      const cls = classify(tab, name, industryRaw, map);
      const url = String(r[c.url] ?? "").trim();
      const phone = String(r[c.phone] ?? "").trim();
      const cand = {
        tab,
        row: rowNo,
        name,
        phone,
        address: c.address != null ? String(r[c.address] ?? "").trim() || null : null,
        url,
        urlKind: urlKind(url),
        industryRaw,
        vertical: cls.vertical ?? "要確認",
        verticalSource: cls.source,
        verticalReason: cls.reason,
        nameIsPhone: /^[\d\-－ー\s()（）+]{9,}$/.test(name),
        registered: ledNames.has(name),
        status: c.status != null ? String(r[c.status] ?? "").trim() : null,
      };
      stat.candidates++;
      result.candidates.push(cand);
    });
    result.tabs[tab] = stat;
  }
  return result;
}

async function main() {
  const includeRegistered = process.argv.includes("--include-registered");
  const raw = await readSheets();
  const res = buildCandidates(raw, { includeRegistered });
  res.generatedAt = new Date().toISOString();
  res.note = "読むだけ。備考は保存していない。候補=台帳に店名の完全一致(NFC・前後空白除く)で載っていない店";
  mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `intake-${today()}.json`);
  if (!includeRegistered) writeFileSync(file, JSON.stringify(res, null, 2) + "\n");
  for (const [tab, s] of Object.entries(res.tabs))
    console.log(`${tab}: 店の行 ${s.rows} / 台帳にあり ${s.registered} / 作らない ${s.excluded} / 候補 ${s.candidates}${s.duplicateNames.length ? ` / 同名の重複 ${s.duplicateNames.join(",")}` : ""}`);
  const byV = {};
  for (const x of res.candidates.filter((x) => x.tab === "トリニティアポ")) byV[x.vertical] = (byV[x.vertical] || 0) + 1;
  console.log("トリニティ候補の業種別:", JSON.stringify(byV));
  if (!includeRegistered) console.log(`保存: ${file}`);
  else return res;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`[fatal] ${e.message}`);
    process.exit(1);
  });
}
