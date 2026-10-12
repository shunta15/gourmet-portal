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
  alt: string;
};

export type PfView = {
  /** "01" … */
  no: string;
  /** 視点の見出し（横組みの文字列。aria 用） */
  name: string;
  /** 縦書きの小見出しの列 */
  cols: string[];
  /** 項目の小見出し（あれば） */
  heading: string;
  /** 本文の最初の 2〜3 文（90〜120 字ほど）。残りは rest（「続きを読む」で開く） */
  head: string;
  rest: string[];
  photos: PfPhoto[];
};

/** 本文を「最初の数文」と「残り」に分けたもの（文字は変えない） */
export type PfText = { head: string; rest: string[] };

export type PfBlock =
  | { kind: "view"; view: PfView; variant: "A" | "B" | "C" | "D" | "E" }
  | { kind: "band"; photos: PfPhoto[]; no: number }
  /** 縦長の写真の視点（a）と、次の視点（b）の写真を、高さをそろえて横に接して並べる（縦長の写真の横のすき間を作らない） */
  | { kind: "pair"; a: PfView; b: PfView }
  /** 巻頭の写真の列に写真を出した視点（小見出しは写真の上に出ているので、文だけを出す） */
  | { kind: "note"; view: PfView };

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
  /** 使った写真の枚数（主役 + 視点 + 写真だけの面） */
  photoCount: number;
  /** そのうち、店ページから足した枚数 */
  fromShop: number;
};

const ROUND = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

export function toPf(p: Photo, alt: string): PfPhoto {
  const known = p.w > 0 && p.h > 0;
  const raw = known ? p.w / p.h : 4 / 3;
  const ar = Math.min(1.9, Math.max(0.72, raw));
  return { src: p.src, ar: ROUND(ar), cap: known ? Math.round(p.w * 1.3) : 1170, port: ar < 0.95, nh: known ? p.h : 0, alt };
}

/* ───────── 縦書きの列に割る ───────── */

const OPEN_OK = "、。！？」』）・";
const NO_HEAD = "、。，．」』）！？ー・";

/** 文字の並びを n 列に割る。句読点の後ろで切れるようにし、列の先頭に 、。 が来ないようにする */
export function splitBalanced(chars: string[], n: number): string[] {
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

/** 縦書きの 1 列に入れる字数の上限 maxPer で、列に割る（最大 maxCols 列） */
export function tateCols(text: string, maxPer: number, maxCols = 3): string[] {
  const chars = Array.from(text.trim());
  if (chars.length <= maxPer) return [chars.join("")];
  const byPhrase = phraseCols(chars, -1, maxPer);
  if (byPhrase && byPhrase.length <= maxCols) return byPhrase;
  const n = Math.min(maxCols, Math.ceil(chars.length / maxPer));
  return splitBalanced(chars, n);
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
function phraseCols(chars: string[], emAt: number, maxPer: number): string[] | null {
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
  for (const p of pieces) {
    if (p.length <= maxPer + 1) out.push(p.join(""));
    else out.push(...splitBalanced(p, Math.ceil(p.length / maxPer)));
  }
  return out.length <= 4 ? out : null;
}

/** titleHTML（<br>・<em> だけ意味を持つ）から、題の縦書きの列と、強調の範囲を取り出す */
export function titleColumns(titleHTML: string, fallback: string): PfData["title"] {
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
  else cols = phraseCols(chars, emFrom >= 0 && emTo > emFrom ? emFrom : -1, MAXPER) ?? splitBalanced(chars, Math.min(4, Math.max(2, Math.ceil(len / 10))));
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
  return { fr: photos.map((p) => `${p.ar}fr`).join(" "), cap: Math.round(cap + 6 * (photos.length - 1)), ar: ROUND(sum) };
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

export function buildPhotoFeature(A: FeatureArticle, store: Restaurant | null): PfData {
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

  const views: PfView[] = A.ranking.map((r, i) => ({
    no: String(i + 1).padStart(2, "0"),
    name: r.name,
    cols: tateCols(r.name, 11, 3),
    heading: r.heading ? stripTabelogScore(r.heading) : "",
    ...splitExcerpt(stripTabelogScore(r.desc)),
    photos: vPhotos[i].map((p) => toPf(p, alt(r.name))),
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
      blocks.push({ kind: "pair", a: v, b: nx });
      last = i + 1;
      i++;
    } else {
      blocks.push({ kind: "view", view: v, variant: VARIANTS[vi % VARIANTS.length] });
    }
    vi++;
    const bp = bandAfter.get(last);
    if (bp) blocks.push({ kind: "band", photos: bp.map((p) => toPf(p, alt("店の写真"))), no: ++bandNo });
  }

  const sub = A.subtitle ? stripTabelogScore(A.subtitle) : "";
  return {
    id: A.id,
    title: titleColumns(A.titleHTML, A.title),
    subCols: sub ? tateCols(sub, 12, 2) : [],
    lede: splitExcerpt(stripTabelogScore(A.lede)),
    hero: heroPf,
    heroAlt: alt("主役の写真"),
    coverPair,
    shop: store ? { id: store.id, name: store.name, cuisine: store.cuisine, area: store.area } : null,
    blocks,
    info: infoRows(store),
    mapsUrl: mapsUrlOf(A),
    quote: A.quote ? paragraphs(stripTabelogScore(A.quote), 90) : [],
    closing: A.closing ? splitExcerpt(stripTabelogScore(A.closing)) : { head: "", rest: [] },
    photoCount: used,
    fromShop,
  };
}
