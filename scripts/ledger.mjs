// 生成済み記事の台帳（行番号に依存しない「店舗の固有ID」基準の処理済み管理）
//
// 背景: スプシ「詰めOKリスト」は IMPORTRANGE で D列/J列が動的に入れ替わるため、
//   行番号 + W列「済」で処理済みを管理すると、行がズレた瞬間に破綻する
//   （生成済みの店が空行に移って再生成 / 新店が「済」行に来てスキップ）。
// 対策: 店舗の固有ID = cid（Google Maps の place id、J列URLに含まれる）と
//   店名キーで「生成済み」を管理する。cid は IMPORTRANGE でも店舗と一緒に動く。
//
// 台帳ファイル: automation/generated-ledger.json
//   { cids: { "<cid>": {articleId,name,url,addedAt} },
//     names: { "<nameKey>": {articleId,url,addedAt} } }

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const LEDGER_PATH = join(__dirname, '..', 'automation', 'generated-ledger.json');

// J列 Maps URL から cid（数値の place id）を抽出。無ければ null
export function cidFromUrl(url) {
  if (!url) return null;
  const m = String(url).match(/[?&]cid=(\d+)/);
  return m ? m[1] : null;
}

// 店名を比較用キーに正規化
//  - 全角英数字を半角へ（２代目 ⇔ 2代目 の揺れ対策）
//  - 空白・全角空白・ゼロ幅を除去
//  - 記号/括弧類を除去（炭や。よつ葉 ⇔ 炭やよつ葉、くすの樹(KUSUNOKI) ⇔ くすの樹 等の揺れ対策）
export function nameKey(name) {
  if (!name) return '';
  let s = String(name).replace(/^'+/, '');
  // 全角英数字 → 半角
  s = s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  // ゼロ幅
  s = s.replace(/[​-‍﻿]/g, '');
  // 空白
  s = s.replace(/[\s　]+/g, '');
  // 記号・括弧・区切り類
  s = s.replace(/[。、・｜|（）()【】\[\]「」『』{}＆&\-－—〜~,，.／/]/g, '');
  return s.toLowerCase().trim();
}

export function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return { cids: {}, names: {} };
  try {
    const j = JSON.parse(readFileSync(LEDGER_PATH, 'utf-8'));
    return { cids: j.cids || {}, names: j.names || {} };
  } catch {
    return { cids: {}, names: {} };
  }
}

export function saveLedger(led) {
  writeFileSync(LEDGER_PATH, JSON.stringify(led, null, 1));
}

// この (url,name) の店舗が既に生成済みか
export function isGenerated(led, url, name) {
  const cid = cidFromUrl(url);
  if (cid && led.cids[cid]) return true;
  const nk = nameKey(name);
  if (nk && led.names[nk]) return true;
  return false;
}

// 台帳に追記。cid と nameKey の両方を登録（どちらか欠けても可）
export function addEntry(led, { cid, name, articleId, url }) {
  const at = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19) + '+09:00';
  if (cid) led.cids[String(cid)] = { articleId: articleId || null, name: name || null, url: url || null, addedAt: at };
  const nk = nameKey(name || articleId);
  if (nk) led.names[nk] = { articleId: articleId || null, url: url || null, addedAt: at };
  return led;
}
