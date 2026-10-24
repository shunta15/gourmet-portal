/**
 * automation/v2/lib/util.mjs — 第2段(write.mjs)の共通の道具
 * 触るのはリポジトリの中のファイルと作業フォルダだけ。シート・Supabase・本番には触らない。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const V2 = path.resolve(HERE, "..");
export const REPO = path.resolve(V2, "../..");
export const OUT_DIR = path.join(V2, "out");
export const WORK_DIR = path.join(V2, "work");
export const abs = (...p) => path.join(REPO, ...p);

export const nfc = (s) => (s == null ? s : String(s).normalize("NFC"));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const jitter = (a, b) => a + Math.random() * (b - a);
export const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
export const nowIso = () => new Date().toISOString();

export function readJson(f, fallback) {
  if (!existsSync(f)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`ファイルがありません: ${f}`);
  }
  return JSON.parse(readFileSync(f, "utf8"));
}
/** 途中で止まっても壊れないよう、いったん別名で書いてから置き換える */
export function writeJson(f, obj) {
  mkdirSync(path.dirname(f), { recursive: true });
  const tmp = `${f}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(obj, null, 2) + "\n");
  renameSync(tmp, f);
}
export const ensureDir = (d) => mkdirSync(d, { recursive: true });

export const VERTICAL_EN = {
  グルメ: "gourmet",
  ビューティー: "beauty",
  ボディケア: "bodycare",
  ペット: "pet",
  ステイ: "stay",
  アクティビティ: "activity",
  スポーツ: "sports",
  くらし: "life",
};
/** 作らない業種(オーナー指示 2026-10-25「暮らしはデザインないので作成しなくていいよ」) */
export const SKIP_VERTICALS = new Set(["くらし", "要確認"]);

/** 店のキー(作業フォルダ名)。グルメ以外は build-places / build-features が読む「tri-<業種>-<行>」 */
export const keyOf = (vEn, row) => `tri-${vEn}-${row}`;

/**
 * 記事 ID(グルメ)。NFC・空白と URL で壊れる記号を落とす(廃止メモ §5-5・6)。
 * 例: 「季節料理 はせ部」→「季節料理はせ部」
 */
export function articleIdOf(name) {
  let s = nfc(name).replace(/^'+/, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)); // 全角の英数字は半角に(台帳の nameKey と同じ)
  s = s.replace(/[\s　​-‍﻿]+/g, "");
  s = s.replace(/[\/\\?&#%"'<>|:;*]/g, "");
  return s;
}

/** コマンドの引数(--name value / --flag) */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const [k, v] = a.slice(2).split("=");
    if (v !== undefined) out[k] = v;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
    else out[k] = true;
  }
  return out;
}

export function listDir(d) {
  return existsSync(d) ? readdirSync(d) : [];
}

/** ログ(標準エラー。時刻つき) */
export function log(...a) {
  const t = new Date(Date.now() + 9 * 3600e3).toISOString().slice(11, 19);
  console.error(`[${t}]`, ...a);
}

/** 文字列を比べるための形(NFKC・空白と区切り記号を落とす)。事実の裏取りでだけ使う(店の照合には使わない) */
export function squash(s) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/[\s​-‍﻿]+/g, "")
    .replace(/[、。,.・「」『』()（）\[\]【】:：;；!！?？\-－―ー~〜‐-―−]/g, "")
    .toLowerCase();
}
