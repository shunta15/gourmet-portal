/**
 * 写真が主役の特集記事（試作 /proto-gourmet/photo-feature/[id]）の、ページに渡すデータを作る（純関数。fs・process は使わない）。
 * サーバーのページから呼ぶ。記事（getFeatureArticleById の結果）と、対の店（ARTICLE_STORE_ID_BY_FEATURE の店）を受け取り、
 *  - 写真を集めて重複を除き（collect.ts）、主役・視点・写真だけの面に割り振る
 *  - 題・小見出しを縦書きの列に割る
 *  - 本文を読みやすい段落に割る（文字は変えない。割るだけ）
 *  - 店の案内の行を作る
 * 文言は記事・店のデータにあるものだけを使う（新しい文は作らない）。
 */
import type { FeatureArticle, Restaurant } from "@/lib/regions";
import { isGoogleMapsUrl } from "@/lib/maps";
import { stripTabelogScore } from "@/lib/portal/noren/tabelogScore";
import { collectPhotos, type Photo } from "./collect";
import { gateUnitsFor, nrWordsFor } from "./featured";

export type PfPhoto = {
  src: string;
  /** 枠の縦横比（幅 ÷ 高さ）。元の比を 0.72〜1.9 に収めたもの。元の大きさが分からない写真は 4/3 */
  ar: number;
  /** 表示する幅の上限（CSS px）。元の幅の 1.3 倍まで（引き伸ばしすぎない） */
  cap: number;
  /** 縦長か（ar < 0.95） */
  port: boolean;
  /** 元の高さ（CSS px 相当。分からなければ 0）。枠を縦に伸ばして切り抜くとき、元の 1.3 倍を超えないための上限に使う */
  nh: number;
  /** 枠の中で写真を拡大しておく倍率（スクロールで中身がずれても枠の外が見えない余白）。cap はこの分だけ小さくしてある（枠の幅 × z ≤ 元の幅の 1.3 倍） */
  z: number;
  alt: string;
};

/** 視点ごとの、写真の現れ方（場面ごとに仕組みを変える）。converge は 2 枚以上の列、ほかは 1 枚の列 */
export type Rv = "curtain" | "converge" | "tilt" | "flow" | "paper" | "none";

export type PfView = {
  /** "01" … */
  no: string;
  /** 視点の見出し（横組みの文字列。aria 用） */
  name: string;
  /** 縦書きの小見出しの列 */
  cols: string[];
  /** 写真のない視点で、和紙の面に大きな縦書きで置く見出しの列（1 列 8 字ほど・最大 4 列。写真のある視点では使わない） */
  big: string[];
  /** 項目の小見出し（あれば） */
  heading: string;
  /** 本文の最初の 2〜3 文（90〜120 字ほど）。残りは rest（「続きを読む」で開く） */
  head: string;
  rest: string[];
  photos: PfPhoto[];
  /** 視点の頭に掛ける小さな暖簾に染め抜く字（見出しの字と番号の漢数字だけ。最大 3 つ） */
  nr: string[];
};

/** 本文を「最初の数文」と「残り」に分けたもの（文字は変えない） */
export type PfText = { head: string; rest: string[] };

export type PfBlock =
  | { kind: "view"; view: PfView; variant: "A" | "B" | "C" | "D" | "E"; rv: Rv }
  | { kind: "band"; photos: PfPhoto[]; no: number; rv: Rv }
  /** 縦長の写真の視点（a）と、次の視点（b）の写真を、高さをそろえて横に接して並べる（縦長の写真の横のすき間を作らない） */
  | { kind: "pair"; a: PfView; b: PfView; rv: Rv }
  /** 巻頭の写真の列に写真を出した視点（小見出しは写真の上に出ているので、文だけを出す） */
  | { kind: "note"; view: PfView }
  /** 写真の多い視点（または写真だけの面）。画面に留めて、重なった写真をスクロールで 1 枚ずつ入れ替える（紙芝居）。photos[i] の小見出しは views[owner[i]]（無ければ -1） */
  | { kind: "stack"; views: PfView[]; photos: PfPhoto[]; owner: number[] }
  /** 写真が 1 枚ずつの視点が 3 つ続くとき、その 3 つの写真を、画面に留めて横へ流れる帯にする（スマホは横にはらう帯）。小見出しは写真の上、文は帯の下 */
  | { kind: "film"; views: PfView[]; photos: PfPhoto[] }
  /** 特集記事の無い店（店のデータだけで組む 1 ページ）: 小見出しの無い、写真の列（0〜3 枚）+ 文。写真が 0 枚なら、和紙の面に文だけ（筆の線と朱の印で区切る） */
  | { kind: "plain"; photos: PfPhoto[]; text: PfText; variant: "A" | "B" | "C" | "D" | "E"; rv: Rv }
  /** 特集記事の無い店: 店のデータの「特徴」（短い箇条）。和紙の面に、朱の点を打って並べる */
  | { kind: "points"; items: string[] };

export type PfData = {
  id: string;
  /** 題の縦書きの列。em は強調する字の範囲（全体の何字めから何字めまで） */
  title: { cols: string[]; per: number; em: [number, number] | null; plain: string };
  subCols: string[];
  lede: PfText;
  hero: PfPhoto | null;
  heroAlt: string;
  /** 主役の写真が小さい（元の幅 × 1.3 が 900px 未満）とき、巻頭で主役の写真の横に接して並べる、最初の視点（その写真 1 枚）。無ければ null */
  coverPair: PfView | null;
  shop: { id: string; name: string; cuisine: string; area: string } | null;
  blocks: PfBlock[];
  info: [string, string][];
  mapsUrl: string;
  quote: string[];
  closing: PfText;
  /** 入口の暖簾に染める字（featured.ts の GATE_UNITS。表にない記事は null = 店名から自動で割る） */
  gate: string[] | null;
  /** 巻頭の「特集」の札を出すか（特集記事の 1 ページは true。特集記事の無い店は false） */
  tag: boolean;
  /** 使った写真の枚数（主役 + 視点 + 写真だけの面） */
  photoCount: number;
  /** そのうち、店ページから足した枚数 */
  fromShop: number;
};

const ROUND = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

/** 写真を表示用にする。表示の幅の上限 cap は「元の幅 × 1.3 ÷ z」（枠の中で z 倍に拡大して動かしても、元の 1.3 倍を超えない） */
export function toPf(p: Photo, alt: string, z = 1.04): PfPhoto {
  const known = p.w > 0 && p.h > 0;
  const raw = known ? p.w / p.h : 4 / 3;
  const ar = Math.min(1.9, Math.max(0.72, raw));
  return { src: p.src, ar: ROUND(ar), cap: Math.round(((known ? p.w : 900) * 1.3) / z), port: ar < 0.95, nh: known ? p.h : 0, z, alt };
}

/* ───────── 縦書きの列に割る ───────── */

const OPEN_OK = "、。！？」』）・";
const NO_HEAD = "、。，．」』）！？ー・";

/** 文字の並びを n 列に割る。句読点の後ろで切れるようにし、列の先頭に 、。 が来ないようにする。isCut（あれば）は、i 字めの手前が語の切れ目か（切れ目でない所は切りにくくする） */
export function splitBalanced(chars: string[], n: number, isCut?: (i: number) => boolean): string[] {
  const len = chars.length;
  if (n <= 1 || len <= 2) return [chars.join("")];
  const out: string[] = [];
  let start = 0;
  for (let k = 1; k < n; k++) {
    const ideal = Math.round((len * k) / n);
    let best = Math.min(len - 1, Math.max(start + 1, ideal));
    let bd = 1e9;
    for (let i = Math.max(start + 2, ideal - 5); i <= Math.min(len - 2, ideal + 5); i++) {
      let d = Math.abs(i - ideal);
      if (!OPEN_OK.includes(chars[i - 1])) d += 4;
      if (NO_HEAD.includes(chars[i])) d += 20;
      if (isCut && !isCut(i)) d += 6;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    out.push(chars.slice(start, best).join(""));
    start = best;
  }
  out.push(chars.slice(start).join(""));
  return out;
}

/** 語の切れ目（文字の位置。Array.from の数え方）。Intl.Segmenter が使えなければ空 */
function wordCuts(text: string): Set<number> {
  const cuts = new Set<number>();
  try {
    const seg = new Intl.Segmenter("ja", { granularity: "word" });
    let pos = 0;
    for (const x of seg.segment(text)) {
      pos += Array.from(x.segment).length;
      cuts.add(pos);
    }
  } catch {
    /* 語の切れ目が取れなければ、字数だけで割る */
  }
  return cuts;
}

/** 縦書きの 1 列に入れる字数の上限 maxPer で、列に割る（最大 maxCols 列）。words が true のときは、語の途中で切れないようにする（写真のない視点の大きな見出し用） */
export function tateCols(text: string, maxPer: number, maxCols = 3, words = false): string[] {
  const chars = Array.from(text.trim());
  if (chars.length <= maxPer) return [chars.join("")];
  const cuts = words ? wordCuts(chars.join("")) : undefined;
  const byPhrase = phraseCols(chars, -1, maxPer, cuts);
  if (byPhrase && byPhrase.length <= maxCols) return byPhrase;
  const n = Math.min(maxCols, Math.ceil(chars.length / maxPer));
  return splitBalanced(chars, n, cuts && cuts.size > 0 ? (i) => cuts.has(i) : undefined);
}

/** 空白を整える。日本語の字の隣の空白は落とし、英数字どうしの間の空白だけを 1 つ残す */
function squash(s: string): string {
  const t = s.replace(/[\s　]+/g, " ").trim();
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch !== " ") {
      out += ch;
      continue;
    }
    const a = t[i - 1] ?? "";
    const b = t[i + 1] ?? "";
    if (/[A-Za-z0-9]/.test(a) && /[A-Za-z0-9]/.test(b)) out += " ";
  }
  return out;
}

const ENT: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

/**
 * 句読点の後ろ・屋号（em）の手前で切って、列にする（読みの切れ目を残す）。長すぎる句はさらに割り、全部で 4 列を超えるなら null。
 * 短い句が続くときは、隣とまとめて 4 列以内にする。
 */
function phraseCols(chars: string[], emAt: number, maxPer: number, cuts?: Set<number>): string[] | null {
  const len = chars.length;
  const cut: number[] = [];
  for (let i = 1; i < len; i++) {
    if ((OPEN_OK.includes(chars[i - 1]) && !NO_HEAD.includes(chars[i])) || i === emAt) cut.push(i);
  }
  const bounds = [0, ...cut, len];
  let pieces = bounds.slice(1).map((b, i) => chars.slice(bounds[i], b));
  while (pieces.length > 4) {
    let k = 0;
    let m = 1e9;
    for (let i = 0; i < pieces.length - 1; i++) {
      const l = pieces[i].length + pieces[i + 1].length;
      if (l < m) {
        m = l;
        k = i;
      }
    }
    pieces = [...pieces.slice(0, k), [...pieces[k], ...pieces[k + 1]], ...pieces.slice(k + 2)];
  }
  const out: string[] = [];
  let off = 0;
  for (const p of pieces) {
    if (p.length <= maxPer + 1) out.push(p.join(""));
    else {
      const o = off;
      out.push(...splitBalanced(p, Math.ceil(p.length / maxPer), cuts && cuts.size > 0 ? (i) => cuts.has(o + i) : undefined));
    }
    off += p.length;
  }
  return out.length <= 4 ? out : null;
}

/** titleHTML（<br>・<em> だけ意味を持つ）から、題の縦書きの列と、強調の範囲を取り出す */
export function titleColumns(titleHTML: string, fallback: string, words = false): PfData["title"] {
  const html = titleHTML || fallback;
  let text = "";
  const breaks: number[] = [];
  let emFrom = -1;
  let emTo = -1;
  for (const m of html.matchAll(/<br\s*\/?>|<\/?em>|<[^>]+>|[^<]+/gi)) {
    const t = m[0];
    if (/^<br/i.test(t)) breaks.push(Array.from(squash(text)).length);
    else if (/^<em>/i.test(t)) emFrom = emFrom < 0 ? Array.from(squash(text)).length : emFrom;
    else if (/^<\/em>/i.test(t)) emTo = emTo < 0 ? Array.from(squash(text)).length : emTo;
    else if (t.startsWith("<")) continue;
    else text += t.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (x) => ENT[x] ?? x);
  }
  const plain = squash(text);
  const chars = Array.from(plain);
  const len = chars.length;
  const MAXPER = 12;
  const br = breaks.filter((b) => b > 0 && b < len);
  const cuts = [0, ...br, len];
  const byBr = br.length > 0 ? cuts.slice(1).map((b, i) => chars.slice(cuts[i], b).join("")) : [];
  let cols: string[];
  if (byBr.length > 0 && byBr.length <= 4 && byBr.every((c) => Array.from(c).length <= MAXPER + 3)) cols = byBr;
  else {
    // words が true（特集記事の無い店の店名）のときは、語（空白で分かれた欧文の語など）の途中で列が切れないようにする
    const wcuts = words ? wordCuts(plain) : undefined;
    cols =
      phraseCols(chars, emFrom >= 0 && emTo > emFrom ? emFrom : -1, MAXPER, wcuts) ??
      splitBalanced(chars, Math.min(4, Math.max(2, Math.ceil(len / 10))), wcuts && wcuts.size > 0 ? (i) => wcuts.has(i) : undefined);
    if (words) cols = cols.map((c) => c.trim()).filter((c) => c.length > 0);
  }
  const em: [number, number] | null = emFrom >= 0 && emTo > emFrom && emTo <= len ? [emFrom, emTo] : null;
  return { cols, per: Math.max(...cols.map((c) => Array.from(c).length)), em, plain };
}

/* ───────── 本文を段落に割る ───────── */

/** 文（。！？の後ろ）で区切って、1 段落 約 target 字になるようにまとめる。字は変えない */
export function paragraphs(text: string, target = 110): string[] {
  const out: string[] = [];
  // データに、改行ではなく「\n」という 2 文字がそのまま入っている記事がある。段落の切れ目として扱う（文字を足す・消すのは、この切れ目の記号だけ）
  for (const block of text.split(/(?:\\n|\n)+/)) {
    const t = block.trim();
    if (!t) continue;
    const sents = t.split(/(?<=[。！？])(?![」』）])/).filter((s) => s.trim());
    let cur = "";
    for (const s of sents) {
      if (cur && cur.length >= target) {
        out.push(cur);
        cur = "";
      } else if (cur && cur.length + s.length > target * 1.6) {
        out.push(cur);
        cur = "";
      }
      cur += s;
    }
    if (cur) out.push(cur);
  }
  // 最後の段落が極端に短ければ、前にくっつける
  if (out.length > 1 && out[out.length - 1].length < 28) {
    const last = out.pop()!;
    out[out.length - 1] += last;
  }
  return out;
}

/**
 * 本文を「最初の数文（90 字を超えたところで切る。1 文が長ければその文まで）」と「残りの段落」に分ける。文の切れ目（。！？）でだけ切り、字は変えない。
 * 残りは「続きを読む」（details）で開く。全文が 90 字に満たなければ rest は空。
 */
export function splitExcerpt(text: string, min = 90, max = 150): PfText {
  const paras = paragraphs(text, 100000);
  const sents: { t: string; end: boolean }[] = [];
  for (const para of paras) {
    const ss = para.split(/(?<=[。！？])(?![」』）])/).filter((x) => x.trim());
    ss.forEach((t, i) => sents.push({ t, end: i === ss.length - 1 }));
  }
  let head = "";
  let k = 0;
  while (k < sents.length) {
    if (head.length >= min) break;
    if (head.length >= 60 && head.length + sents[k].t.length > max) break;
    head += sents[k].t;
    k++;
  }
  if (k >= sents.length) return { head, rest: [] };
  // 残り: 元の段落の切れ目を残してから、読みやすい長さに割る
  let restText = "";
  for (let i = k; i < sents.length; i++) restText += sents[i].t + (sents[i].end && i < sents.length - 1 ? "\n" : "");
  return { head, rest: paragraphs(restText, 110) };
}

/** 写真の並び（横に接して並べる）の、縦横比の合計と、幅の上限（どの写真も元の幅の 1.3 倍を超えない幅） */
export function rowOf(photos: PfPhoto[]): { fr: string; cap: number; ar: number } {
  const sum = photos.reduce((a, p) => a + p.ar, 0);
  const cap = Math.min(...photos.map((p) => (p.cap * sum) / p.ar));
  // 1 枚だけの列は、枠いっぱい（縦長の 0.75fr のように 1 未満の fr だけの列は、CSS の仕様で枠の 75% までしか使われず、横が空く）
  const fr = photos.length === 1 ? "minmax(0, 1fr)" : photos.map((p) => `${p.ar}fr`).join(" ");
  return { fr, cap: Math.round(cap + 6 * (photos.length - 1)), ar: ROUND(sum) };
}

/* ───────── 店の案内・行き先 ───────── */

const blank = (v: string | undefined | null) => !v || !v.trim() || /^[-—－\s]+$/.test(v);

/** 店の案内の行（店のデータにあるものだけ。空・ハイフンは出さない） */
export function infoRows(s: Restaurant | null): [string, string][] {
  if (!s) return [];
  const rows: [string, string | undefined][] = [
    ["店名", s.name],
    ["業種", s.cuisine],
    ["住所", s.address],
    ["営業時間", s.hours],
    ["定休日", s.closed],
    ["席", s.seats],
    ["最寄り", s.nearest],
    ["予算", s.budget],
    ["電話", s.phone ?? undefined],
  ];
  return rows.filter(([, v]) => !blank(v)).map(([k, v]) => [k, v!.trim()] as [string, string]);
}

/**
 * 店の対が無い単独店の記事（店のデータが無い）の「店舗情報」の行: 記事の視点（ranking[].specs）にある、店そのものについての項目だけを、記事のとおりに出す。
 * 項目名のゆれ（所在地 = 住所、営業 = 営業時間、席数 = 席、最寄り駅・最寄駅 = 最寄り、価格帯 = 予算）は、下の表で同じ行にまとめる。表に無い項目（看板・雰囲気・名物 など）は出さない。
 * 値が空・ハイフンの項目は出さない。同じ項目が視点ごとに違う値で出てくるときは、違う値を先頭から 2 つまで「／」でつなぐ。新しい文・値は作らない。
 */
const ARTICLE_INFO_KEYS: [string, string[]][] = [
  ["住所", ["住所", "所在地"]],
  ["最寄り", ["最寄り", "最寄り駅", "最寄駅"]],
  ["アクセス", ["アクセス"]],
  ["営業時間", ["営業時間", "営業"]],
  ["定休日", ["定休日"]],
  ["席", ["席数", "席"]],
  ["予算", ["予算", "価格帯"]],
  ["電話", ["電話"]],
];
export function articleInfoRows(A: FeatureArticle): [string, string][] {
  const rows: [string, string][] = [];
  for (const [label, keys] of ARTICLE_INFO_KEYS) {
    const vals: string[] = [];
    for (const r of A.ranking) for (const sp of r.specs) if (keys.includes(sp.k) && !blank(sp.v) && !vals.includes(sp.v.trim())) vals.push(sp.v.trim());
    if (vals.length) rows.push([label, vals.slice(0, 2).join("／")]);
  }
  return rows;
}

/** 記事の視点にある Google マップの URL（無ければ空。検索リンクは作らない） */
export function mapsUrlOf(A: FeatureArticle): string {
  for (const r of A.ranking) {
    const cand = [r.href, ...r.specs.map((s) => s.v)].find((v) => v && isGoogleMapsUrl(v));
    if (cand) return cand;
  }
  return "";
}

/* ───────── 写真の割り振り ───────── */

const VARIANTS = ["A", "C", "B", "D", "E"] as const;

/** 写真は 全体で 12 枚ほどまで（主役を含む） */
export const PHOTO_BUDGET = 12;
const PER_VIEW_MAX = 3;


/**
 * 「横に流れる帯」（pf-film。写真が 1 枚ずつの視点 3 つが、スクロールで横へ流れる）を作るか。2026-10-12 オーナー指示「おびなしで一旦確定、横に流れるものは残しておいて」で、既定は作らない（どの記事も紅梅庵の形）。
 * 帯のコード（ここの作り方・PhotoFeaturePage の FilmBlock・Motion・photofeature.css）は消さずに残してある。true にすると、写真が 1 枚ずつの視点が 3 つ以上続く記事に帯が戻る。
 * 見本のページ（/proto-gourmet/photo-feature/<ID>?film=1）だけは、URL で帯ありを見られる（サーバー側で読んで opts で渡す。本番のページは URL を読まない）。
 */
export const PF_FILM = false;

export function buildPhotoFeature(A: FeatureArticle, store: Restaurant | null, opts: { film?: boolean } = {}): PfData {
  const withFilm = opts.film ?? PF_FILM;
  const shopName = store?.name ?? "";
  const c = collectPhotos(A, store);
  const alt = (what: string) => (shopName ? `${shopName}（${what}）` : what);

  // 視点の写真（1 視点 3 枚まで。あふれた分は「写真だけの面」へ）
  const vPhotos: Photo[][] = c.views.map((l) => l.slice(0, PER_VIEW_MAX));
  const overflow: Photo[] = c.views.flatMap((l) => l.slice(PER_VIEW_MAX));
  let pool: Photo[] = [...overflow, ...c.shop];

  // 全体の枚数の上限
  let used = (c.hero ? 1 : 0) + vPhotos.reduce((n, l) => n + l.length, 0);
  if (used + pool.length > PHOTO_BUDGET) pool = pool.slice(0, Math.max(0, PHOTO_BUDGET - used));
  used += pool.length;
  const fromShop = pool.filter((p) => c.shop.includes(p)).length;

  // 小さな暖簾の語: 記事 ID の表 → 店 ID の直しの表 → 自動（featured.ts の nrWordsFor）。見出しの中にある語だけ・同じ記事の中で重ならない
  const nrWords = nrWordsFor(A.id, store?.id ?? null, A.ranking.map((r) => r.name));
  const views: PfView[] = A.ranking.map((r, i) => ({
    no: String(i + 1).padStart(2, "0"),
    name: r.name,
    cols: tateCols(r.name, 11, 3),
    big: tateCols(r.name, 8, 4, true),
    heading: r.heading ? stripTabelogScore(r.heading) : "",
    ...splitExcerpt(stripTabelogScore(r.desc)),
    photos: vPhotos[i].map((p) => toPf(p, alt(r.name))),
    nr: Array.from(nrWords[i]),
  }));

  // 足りない写真が 1 枚だけのときは、本文のいちばん長い視点に足して横に並べる（2 枚以上あれば「写真だけの面」にする）
  let bands: Photo[][] = [];
  if (pool.length === 1 && views.length > 0) {
    let at = -1;
    let len = -1;
    A.ranking.forEach((r, i) => {
      if (views[i].photos.length < PER_VIEW_MAX && r.desc.length > len) {
        len = r.desc.length;
        at = i;
      }
    });
    if (at >= 0) views[at].photos.push(toPf(pool[0], alt(A.ranking[at].name)));
  } else if (pool.length >= 2) {
    const nb = pool.length >= 7 ? 2 : 1;
    const per = Math.ceil(pool.length / nb);
    for (let k = 0; k < nb; k++) bands.push(pool.slice(k * per, (k + 1) * per));
    bands = bands.filter((b) => b.length > 0);
  }

  // 並べる（縦長の写真 1 枚の視点は、次の視点の写真と横に接して並べる。写真だけの面は、視点の真ん中あたりと最後に）
  const n = views.length;
  const blocks: PfBlock[] = [];
  // 主役の写真が小さい記事は、最初の視点の写真を巻頭の主役の横に接して並べる（巻頭の写真の面積を稼ぐ）
  const heroPf = c.hero ? toPf(c.hero, alt("主役の写真")) : null;
  const coverPair: PfView | null =
    heroPf && heroPf.cap < 900 && n >= 2 && views[0].photos.length === 1 && !views[0].photos[0].port && bands.length === 0 ? views[0] : null;
  if (coverPair) blocks.push({ kind: "note", view: coverPair });
  const bandAfter = new Map<number, Photo[]>();
  if (bands.length >= 1) bandAfter.set(Math.max(coverPair ? 1 : 0, Math.ceil(n / 2) - 1), bands[0]);
  if (bands.length >= 2) bandAfter.set(n - 1, bands[1]);
  let bandNo = 0;
  let vi = 0;
  for (let i = coverPair ? 1 : 0; i < n; i++) {
    const v = views[i];
    const nx = views[i + 1];
    let last = i;
    if (v.photos.length === 1 && v.photos[0].port && nx && nx.photos.length > 0 && nx.photos.length <= 2 && !bandAfter.has(i)) {
      blocks.push({ kind: "pair", a: v, b: nx, rv: "converge" });
      last = i + 1;
      i++;
    } else {
      blocks.push({ kind: "view", view: v, variant: VARIANTS[vi % VARIANTS.length], rv: "none" });
    }
    vi++;
    const bp = bandAfter.get(last);
    if (bp) blocks.push({ kind: "band", photos: bp.map((p) => toPf(p, alt("店の写真"))), no: ++bandNo, rv: "converge" });
  }

  // 写真の現れ方: 2 枚以上の列は「左右から寄って接する」、1 枚の列は 暖簾・傾きが落ち着く・中身が流れる・白い紙が引かれる を順に
  const SINGLE: Rv[] = ["curtain", "tilt", "flow", "paper"];
  let si = 0;
  for (const b of blocks) {
    if (b.kind === "view" || b.kind === "pair") {
      const cnt = b.kind === "view" ? b.view.photos.length : b.a.photos.length + b.b.photos.length;
      b.rv = cnt >= 2 ? "converge" : cnt === 1 ? SINGLE[si++ % SINGLE.length] : "none";
      if (b.rv === "flow" && b.kind === "view") for (const p of b.view.photos) { p.cap = Math.round((p.cap * 1.04) / 1.12); p.z = 1.12; }
    }
  }
  // 写真が 1 枚ずつの視点が 3 つ以上続くとき、その真ん中の 3 つを「横に流れる帯」にする（少ない記事では作らない）
  {
    let bestS = -1;
    let bestL = 0;
    for (let i = 0; i < blocks.length; ) {
      let j = i;
      while (j < blocks.length && blocks[j].kind === "view" && (blocks[j] as { view: PfView }).view.photos.length === 1) j++;
      if (j - i > bestL) {
        bestL = j - i;
        bestS = i;
      }
      i = Math.max(j, i + 1);
    }
    if (withFilm && bestL >= 3) {
      const st = bestS + (bestL >= 4 ? 1 : 0);
      const vs = (blocks.slice(st, st + 3) as { view: PfView }[]).map((b) => b.view);
      blocks.splice(st, 3, { kind: "film", views: vs, photos: vs.map((v) => v.photos[0]) });
    }
  }
  // 写真がいちばん多い視点（または写真だけの面）を、画面に留める場面にする。3 枚以上（7 枚以上の記事なら 2 枚）のときだけ
  const cntOf = (b: PfBlock) => (b.kind === "view" ? b.view.photos.length : b.kind === "pair" ? b.a.photos.length + b.b.photos.length : b.kind === "band" ? b.photos.length : 0);
  let pick = -1;
  blocks.forEach((b, i) => {
    if (cntOf(b) >= 2 && (pick < 0 || cntOf(b) > cntOf(blocks[pick]))) pick = i;
  });
  if (pick >= 0 && (cntOf(blocks[pick]) >= 3 || (cntOf(blocks[pick]) === 2 && used >= 7))) {
    const b = blocks[pick];
    if (b.kind === "view") blocks[pick] = { kind: "stack", views: [b.view], photos: b.view.photos, owner: b.view.photos.map(() => 0) };
    else if (b.kind === "pair") blocks[pick] = { kind: "stack", views: [b.a, b.b], photos: [...b.a.photos, ...b.b.photos], owner: [...b.a.photos.map(() => 0), ...b.b.photos.map(() => 1)] };
    else if (b.kind === "band") blocks[pick] = { kind: "stack", views: [], photos: b.photos, owner: b.photos.map(() => -1) };
  }

  const sub = A.subtitle ? stripTabelogScore(A.subtitle) : "";
  return {
    id: A.id,
    // 店のデータが無い単独店の記事（store が null）は、欧文の語の途中で題の列を切らない（店の対がある記事の割りは今までどおり）
    title: titleColumns(A.titleHTML, A.title, store === null),
    subCols: sub ? tateCols(sub, 12, 2) : [],
    lede: splitExcerpt(stripTabelogScore(A.lede)),
    hero: heroPf,
    heroAlt: alt("主役の写真"),
    coverPair,
    gate: store ? gateUnitsFor(A.id, { id: store.id, name: store.name, area: store.area }) : null,
    shop: store ? { id: store.id, name: store.name, cuisine: store.cuisine, area: store.area } : null,
    blocks,
    info: store ? infoRows(store) : articleInfoRows(A),
    mapsUrl: mapsUrlOf(A),
    quote: A.quote ? paragraphs(stripTabelogScore(A.quote), 90) : [],
    closing: A.closing ? splitExcerpt(stripTabelogScore(A.closing)) : { head: "", rest: [] },
    tag: true,
    photoCount: used,
    fromShop,
  };
}

/* ───────── 特集記事の無い店の 1 ページ ───────── */

/**
 * 特集記事の無い店（対の特集記事を持たない店）の 1 ページ。記事の本文が無いので、店のデータにある文・写真だけで、同じ部品で組む:
 *   入口の暖簾 → 巻頭（主役の写真 + 店名の札。写真が無ければ和紙の面に店名を大きく）→ 紹介文（desc）→ 本文の段落（body）に写真を添えて → 特徴（highlights）→ 店舗情報
 * 見どころ（視点）は作らない。小見出し・題・締めの文は作らない（無いものは出さない）。店名・文・写真は店のデータそのまま（新しい事実・文は足さない）。
 * 写真: 店ページの実物の写真（image・heroImages・gallery。使えないもの・重複は除く）。1 つめが巻頭、残りは本文の段落に 1〜3 枚ずつ、あふれた分は写真だけの面へ。写真が 0 枚なら文だけ。
 */
/** 店名の題。縦書きでは、欧文・数字（横に倒れて並ぶ）は 1 字の長さが日本語の字の約 0.6 なので、1 列の長さ（per）はその重みで数える（題の大きさ・札の高さが、欧文の店名で余らないように） */
function shopTitle(name: string): PfData["title"] {
  const t = titleColumns(name, name, true);
  const wlen = (c: string) => Array.from(c).reduce((n, ch) => n + (/[\x20-\x7e]/.test(ch) ? 0.6 : 1), 0);
  return { ...t, per: Math.max(2, Math.ceil(Math.max(...t.cols.map(wlen)))) };
}

export function buildShopPage(store: Restaurant): PfData {
  const c = collectPhotos({ heroImage: store.image, ranking: [] }, store);
  let hero = c.hero;
  let pool: Photo[] = [...c.shop];
  if (!hero && pool.length > 0) hero = pool.shift() ?? null;
  const alt = (what: string) => `${store.name}（${what}）`;
  pool = pool.slice(0, Math.max(0, PHOTO_BUDGET - (hero ? 1 : 0)));
  const used = (hero ? 1 : 0) + pool.length;
  // 主役の写真が小さい（元の幅 × 1.3 が 900px 未満）とき: 次の写真（横長）があれば、巻頭で主役の横に接して並べる（特集記事と同じ coverPair。小見出しは無い）。
  // 次の写真が無い・縦長のときは、小さな写真を巻頭に置かず、巻頭は和紙の面に店名を大きく見せて、その写真は最初の写真の列に回す。
  let heroPf = hero ? toPf(hero, alt("主役の写真")) : null;
  let coverPair: PfView | null = null;
  if (hero && heroPf && heroPf.cap < 900) {
    const next = pool[0] ? toPf(pool[0], alt("店の写真")) : null;
    if (next && !next.port) {
      pool.shift();
      coverPair = { no: "", name: "", cols: [], big: [], heading: "", head: "", rest: [], photos: [next], nr: [] };
    } else {
      pool.unshift(hero);
      hero = null;
      heroPf = null;
    }
  }

  // 文: 本文の段落（点数・口コミの文は店のデータを読む層で取り除いてある。念のため、暖簾の表示の直前と同じ関数を通す）
  const paras = (store.body ?? []).map((t) => stripTabelogScore(t ?? "").trim()).filter((t) => t.length > 0);
  const m = paras.length;
  // 写真を段落に配る: 1 段落に最大 3 枚。あふれた分は写真だけの面（2 枚以上）か、最後の段落（1 枚）へ
  const per = m > 0 ? Math.min(PER_VIEW_MAX, Math.ceil(pool.length / m)) : 0;
  const groups: Photo[][] = paras.map((_, i) => pool.slice(i * per, (i + 1) * per));
  let leftover = pool.slice(m * per);
  if (leftover.length === 1 && m > 0 && groups[m - 1].length < PER_VIEW_MAX) {
    groups[m - 1].push(leftover[0]);
    leftover = [];
  }
  const blocks: PfBlock[] = [];
  const SINGLE: Rv[] = ["curtain", "tilt", "flow", "paper"];
  let si = 0;
  paras.forEach((t, i) => {
    const ph = groups[i].map((p) => toPf(p, alt("店の写真")));
    const rv: Rv = ph.length >= 2 ? "converge" : ph.length === 1 ? SINGLE[si++ % SINGLE.length] : "none";
    if (rv === "flow") for (const p of ph) { p.cap = Math.round((p.cap * 1.04) / 1.12); p.z = 1.12; }
    blocks.push({ kind: "plain", photos: ph, text: { head: t, rest: [] }, variant: VARIANTS[i % VARIANTS.length], rv });
  });
  if (leftover.length >= 2) {
    const nb = leftover.length >= 7 ? 2 : 1;
    const perBand = Math.ceil(leftover.length / nb);
    let at = Math.max(0, Math.ceil(m / 2));
    for (let k = 0; k < nb; k++) {
      const band: PfBlock = { kind: "band", photos: leftover.slice(k * perBand, (k + 1) * perBand).map((p) => toPf(p, alt("店の写真"))), no: k + 1, rv: "converge" };
      blocks.splice(Math.min(at, blocks.length), 0, band);
      at = blocks.length;
    }
  }
  const hl = (store.highlights ?? []).map((t) => stripTabelogScore(t ?? "").trim()).filter((t) => t.length > 0);
  if (hl.length > 0) blocks.push({ kind: "points", items: hl });

  const desc = stripTabelogScore(store.desc ?? "").trim();
  return {
    id: store.id,
    title: shopTitle(store.name),
    subCols: [],
    lede: desc ? splitExcerpt(desc) : { head: "", rest: [] },
    hero: heroPf,
    heroAlt: alt("主役の写真"),
    coverPair,
    gate: gateUnitsFor(null, { id: store.id, name: store.name, area: store.area }),
    shop: { id: store.id, name: store.name, cuisine: store.cuisine, area: store.area },
    blocks,
    info: infoRows(store),
    mapsUrl: "",
    quote: [],
    closing: { head: "", rest: [] },
    tag: false,
    photoCount: used,
    fromShop: used,
  };
}
