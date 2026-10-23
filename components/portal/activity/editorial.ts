import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { vkLineOk } from "@/components/portal/vkit/common/live";

/**
 * 季節の特集・読みもの・はじめての方へのガイド(lib/activity/editorial.json)と、写真から作った動画(lib/activity/videos.json)の読み込み(サーバー専用)。
 * 2 つのファイルは別の担当が作る。ファイルが無い・壊れているあいだは、空として扱う(ビルドは落ちない。画面は、空の欄の中身を出さない)。
 * 文は 1 文ずつ vkLineOk(料金・評価・おすすめ・人気・〇選・効き目をうたう語・体験した言い回しの点検)に通し、通らない文はその 1 文だけ落とす(言い換えない)。
 * 店の ID は、いま載っている店(保留の店を除く)だけ残す。
 *
 * editorial.json の形:
 *  { seasons: [{ id: spring|summer|autumn|winter, title, lead, date, imageFile, sections: [{ heading, text, storeIds }] }],
 *    magazine: [{ id, tag: コラム|エリア特集|店の紹介, title, lead, date, imageFile, sections }],
 *    guide: { title, lead, items: [{ q, a, storeNotes: [{ storeId, text }] }] } }
 * videos.json の形:
 *  [{ id, storeId, title, durationSec, src: /_portal/activity/videos/{id}.mp4, poster: /_portal/activity/videos/{id}.webp }]
 */

export type EdSection = { heading: string; text: string; storeIds: string[] };
export type EdSeasonId = "spring" | "summer" | "autumn" | "winter";
export type EdSeason = { id: EdSeasonId; title: string; lead: string; date: string; imageFile: string; sections: EdSection[] };
export type EdMag = { id: string; tag: string; title: string; lead: string; date: string; imageFile: string; sections: EdSection[] };
export type EdGuideItem = { q: string; a: string; storeNotes: Array<{ storeId: string; text: string }> };
export type EdGuide = { title: string; lead: string; imageFile: string; items: EdGuideItem[] };
export type Editorial = { seasons: EdSeason[]; magazine: EdMag[]; guide: EdGuide | null };
export type Video = { id: string; storeId: string; title: string; durationSec: number; src: string; poster: string };

const SEASONS: EdSeasonId[] = ["spring", "summer", "autumn", "winter"];
export const SEASON_CHAR: Record<EdSeasonId, string> = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** 文ごとに点検して、通る文だけをつなぐ */
function clean(t: unknown): string {
  return str(t)
    .split(/(?<=。)/)
    .map((x) => x.trim())
    .filter((x) => x && vkLineOk(x))
    .join("");
}

/**
 * 記事の写真。editorial.json の imageFile は次のどちらか(パスの区切りや .. は、この 2 つの形以外は受け付けない)。
 *  - 飾り画像のファイル名(public/_portal/activity/ の中のファイル)
 *  - 実在の店の写真(vshops/leisure-<番号>/<ファイル名>。public/_portal/vshops/ の中。その記事に出てくる店の写真を使う)
 * 返すのはサイト内のパス(/_portal/…)。
 */
function imageFile(v: unknown, fallback: string): string {
  const f = str(v);
  if (/^[A-Za-z0-9][A-Za-z0-9._-]*\.(webp|jpg|jpeg|png)$/.test(f)) return `/_portal/activity/${f}`;
  if (/^vshops\/leisure-\d+\/[A-Za-z0-9][A-Za-z0-9._-]*\.(webp|jpg|jpeg|png)$/.test(f)) return `/_portal/${f}`;
  return `/_portal/activity/${fallback}`;
}

function sectionsOf(v: unknown, ok: Set<string>): EdSection[] {
  if (!Array.isArray(v)) return [];
  const out: EdSection[] = [];
  for (const x of v as Array<Record<string, unknown>>) {
    const heading = str(x?.heading);
    const text = clean(x?.text);
    if (!heading || !text) continue;
    const ids = Array.isArray(x.storeIds) ? (x.storeIds as unknown[]).filter((i): i is string => typeof i === "string" && ok.has(i)) : [];
    out.push({ heading, text, storeIds: [...new Set(ids)] });
  }
  return out;
}

// ファイルの場所は、文字そのままで書く(本番のビルドが、読むファイルを実行環境へ同梱できるように。変数にすると同梱されず、再生成のとき空になる)
async function readEditorialJson(): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "lib/activity/editorial.json"), "utf8"));
  } catch {
    return null;
  }
}
async function readVideosJson(): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "lib/activity/videos.json"), "utf8"));
  } catch {
    return null;
  }
}

const DEF_MAG_IMG = ["ar-mag-1.webp", "ar-mag-2.webp", "ar-mag-3.webp"];

/** okIds = いま載っている店の ID(保留の店は入っていない) */
export async function loadEditorial(okIds: string[]): Promise<Editorial> {
  const raw = (await readEditorialJson()) as Record<string, unknown> | null;
  const ok = new Set(okIds);
  const empty: Editorial = { seasons: [], magazine: [], guide: null };
  if (!raw || typeof raw !== "object") return empty;

  const seasons: EdSeason[] = [];
  if (Array.isArray(raw.seasons)) {
    for (const x of raw.seasons as Array<Record<string, unknown>>) {
      const id = str(x?.id) as EdSeasonId;
      if (!SEASONS.includes(id) || seasons.some((s) => s.id === id)) continue;
      const title = str(x.title);
      if (!title) continue;
      seasons.push({ id, title, lead: clean(x.lead), date: str(x.date), imageFile: imageFile(x.imageFile, `ar-season-${id}.webp`), sections: sectionsOf(x.sections, ok) });
    }
    seasons.sort((a, b) => SEASONS.indexOf(a.id) - SEASONS.indexOf(b.id));
  }

  const magazine: EdMag[] = [];
  if (Array.isArray(raw.magazine)) {
    for (const x of raw.magazine as Array<Record<string, unknown>>) {
      const id = str(x?.id);
      const title = str(x?.title);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !title || magazine.some((m) => m.id === id)) continue;
      magazine.push({ id, tag: str(x.tag), title, lead: clean(x.lead), date: str(x.date), imageFile: imageFile(x.imageFile, DEF_MAG_IMG[magazine.length % 3]), sections: sectionsOf(x.sections, ok) });
    }
  }

  let guide: EdGuide | null = null;
  const g = raw.guide as Record<string, unknown> | undefined;
  if (g && typeof g === "object" && Array.isArray(g.items)) {
    const items: EdGuideItem[] = [];
    for (const x of g.items as Array<Record<string, unknown>>) {
      const q = str(x?.q);
      const a = clean(x?.a);
      if (!q || !a) continue;
      const notes = Array.isArray(x.storeNotes)
        ? (x.storeNotes as Array<Record<string, unknown>>)
            .map((n) => ({ storeId: str(n?.storeId), text: clean(n?.text) }))
            .filter((n) => ok.has(n.storeId) && n.text)
        : [];
      items.push({ q, a, storeNotes: notes });
    }
    if (items.length > 0) guide = { title: str(g.title) || "はじめての方へ", lead: clean(g.lead), imageFile: imageFile(g.imageFile, "ar-guide.webp"), items };
  }
  return { seasons, magazine, guide };
}

/** 動画(写真から作った短い動画)。店の ID は載っている店だけ。ファイルが無いあいだは空 */
export async function loadVideos(okIds: string[]): Promise<Video[]> {
  const raw = await readVideosJson();
  if (!Array.isArray(raw)) return [];
  const ok = new Set(okIds);
  const out: Video[] = [];
  for (const x of raw as Array<Record<string, unknown>>) {
    const id = str(x?.id);
    const storeId = str(x?.storeId);
    const src = str(x?.src);
    const poster = str(x?.poster);
    const sec = Number(x?.durationSec);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id) || !ok.has(storeId) || !src.startsWith("/_portal/activity/videos/") || !poster.startsWith("/_portal/activity/videos/") || !(sec > 0)) continue;
    out.push({ id, storeId, title: str(x.title), durationSec: Math.round(sec), src, poster });
  }
  return out;
}

export function durationLabel(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** 「2026-10-23」→「2026.10.23」 */
export function dotDate(d: string): string {
  return d.replace(/-/g, ".");
}

/**
 * 札の 2 行の題。「、」「・」「 」のうち真ん中に近い所で 2 行に分ける(無ければ真ん中)。短い題(maxPerLine 以下)は 1 行。
 * 2 行目が長すぎるときは、はみ出さないよう、そのまま(CSS が折り返しを許す所は呼び出し側で)。
 */
export function twoLines(t: string, maxPerLine = 14): string[] {
  const s = t.trim();
  if (s.length <= maxPerLine) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 1; i < s.length; i++) {
    const c = s[i - 1];
    if ("、,・ 　!?」)".includes(c) && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  const at = best > 0 && Math.abs(best - mid) <= s.length * 0.3 ? best : Math.ceil(mid);
  return [s.slice(0, at).trim(), s.slice(at).trim()].filter(Boolean);
}
