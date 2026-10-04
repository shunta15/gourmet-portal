/**
 * 総合サイトのサイト内検索の中身（純関数。サーバー・クライアントのどちらからも使える。データを読まない）。
 *
 * 候補データ（SearchIndexJson）は lib/portal/searchIndex.ts がビルド時に作り、/search-index.json で配る。
 * クライアントは初回フォーカス時にそれを取得して prepare() し、入力のたびに search() する。/find（サーバー）も同じ関数。
 *
 * 照合の考え方:
 *  - 全角・半角・大文字小文字をそろえ（NFKC・小文字）、カタカナはひらがなにそろえ、空白と「・」は無視する。
 *  - 末尾の「駅」は有無を問わない（「三宮駅」でも「三宮」でも、駅名・別名の「三宮」に当たる）。
 *  - キー（名前・別名・読み仮名）が、完全一致 > 前方一致 > 部分一致 の順で強い。読み仮名は、持てるものだけ持つ
 *    （都道府県・業種・種類など。駅や店の読みは無いので推測で作らない）。
 *  - 空白で区切った複数語は、すべてが（キーか補足の文字に）当たるものだけ。
 */

export type SearchKind = "pref" | "station" | "town" | "category" | "shop";

/** JSON の中での種類の番号（並びを変えない。増やすときは末尾に足す） */
export const KIND_BY_CODE: SearchKind[] = ["pref", "station", "town", "category", "shop"];

export const KIND_LABEL: Record<SearchKind, string> = {
  pref: "都道府県",
  station: "駅",
  town: "市区町村",
  category: "業種・種類",
  shop: "店",
};

/** 結果の表示順（/find のグループの並び・同点のときの順） */
export const KIND_ORDER: SearchKind[] = ["pref", "station", "town", "category", "shop"];

/** 候補1件: [種類の番号, 表示名, 補足（県名・業種など）, 飛び先のパス, 追加のキー（別名・読み仮名。「|」区切り。無ければ省略）] */
export type RawItem = [number, string, string, string] | [number, string, string, string, string];

export interface SearchIndexJson {
  v: 1;
  items: RawItem[];
}

export interface Candidate {
  kind: SearchKind;
  name: string;
  sub: string;
  href: string;
}

export interface Prepared extends Candidate {
  /** 照合用のキー（正規化済み。名前・別名・読み仮名。「駅」を外した形も含む） */
  keys: string[];
  /** 補足の正規化済み文字（複数語の検索で使う） */
  subKey: string;
  /** 元の並び（同点のとき安定させる） */
  ord: number;
}

/** 照合用に文字をそろえる（NFKC・小文字・カタカナ→ひらがな・空白と「・」を除く） */
export function normalize(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s　・･·]/g, "");
}

/** 「駅」で終わる語から「駅」を外した形（外せなければ null。「駅」だけの語は外さない） */
function withoutStation(s: string): string | null {
  return s.length > 1 && s.endsWith("駅") ? s.slice(0, -1) : null;
}

export function prepare(json: SearchIndexJson): Prepared[] {
  const out: Prepared[] = [];
  json.items.forEach((it, i) => {
    const kind = KIND_BY_CODE[it[0]];
    if (!kind) return;
    const raw = [it[1], ...(it[4] ? it[4].split("|") : [])];
    const keys: string[] = [];
    for (const r of raw) {
      const k = normalize(r);
      if (!k) continue;
      keys.push(k);
      const w = withoutStation(k);
      if (w) keys.push(w);
    }
    out.push({ kind, name: it[1], sub: it[2], href: it[3], keys, subKey: normalize(it[2]), ord: i });
  });
  return out;
}

const KIND_BONUS: Record<SearchKind, number> = { pref: 8, station: 5, town: 3, category: 2, shop: 0 };

/** 1語がこの候補にどれだけ当たるか（0 = 当たらない）。キーに当たるほど強く、補足にだけ当たると弱い */
function scoreTerm(p: Prepared, term: string): number {
  const variants = [term];
  const w = withoutStation(term);
  if (w) variants.push(w);
  let best = 0;
  for (const k of p.keys) {
    for (const t of variants) {
      let s = 0;
      if (k === t) s = 100;
      else if (k.startsWith(t)) s = 70;
      // 都道府県は前方一致まで（「京都」で「東京都」が出ないように。短い固有名なので部分一致は要らない）
      else if (p.kind !== "pref") {
        const pos = k.indexOf(t);
        if (pos >= 0) s = 40 - Math.min(pos, 20) / 2;
      }
      if (s > best) best = s;
    }
  }
  if (best === 0 && p.subKey.includes(term)) best = 15;
  return best;
}

/** 種類ごとの上限（ドロップダウンで1種類が埋め尽くさないように） */
export const DEFAULT_CAPS: Record<SearchKind, number> = { pref: 2, station: 4, town: 3, category: 3, shop: 3 };

export interface SearchOptions {
  /** 返す最大件数 */
  limit?: number;
  /** 種類ごとの最大件数 */
  caps?: Partial<Record<SearchKind, number>>;
}

/**
 * 検索。空の入力は空配列。空白区切りの複数語は AND。
 * 並びは 点数（高い順）→ 種類の並び → 名前の短い順 → 元の順。
 */
export function search(items: Prepared[], query: string, opts: SearchOptions = {}): Candidate[] {
  const terms = query
    .normalize("NFKC")
    .split(/[\s　]+/)
    .map(normalize)
    .filter(Boolean);
  if (terms.length === 0) return [];
  const limit = opts.limit ?? 8;
  const caps = { ...DEFAULT_CAPS, ...opts.caps };

  const scored: { p: Prepared; score: number }[] = [];
  for (const p of items) {
    let total = 0;
    let ok = true;
    for (const t of terms) {
      const s = scoreTerm(p, t);
      if (s === 0) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) scored.push({ p, score: total / terms.length + KIND_BONUS[p.kind] });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      KIND_ORDER.indexOf(a.p.kind) - KIND_ORDER.indexOf(b.p.kind) ||
      a.p.name.length - b.p.name.length ||
      a.p.ord - b.p.ord,
  );

  const used: Record<SearchKind, number> = { pref: 0, station: 0, town: 0, category: 0, shop: 0 };
  const out: Candidate[] = [];
  for (const { p } of scored) {
    if (out.length >= limit) break;
    if (used[p.kind] >= caps[p.kind]) continue;
    used[p.kind]++;
    out.push({ kind: p.kind, name: p.name, sub: p.sub, href: p.href });
  }
  return out;
}

/** 同じ href の候補を重複させない（種類が違っても同じ飛び先なら1つ） */
export function uniqueByHref<T extends { href: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((x) => (seen.has(x.href) ? false : (seen.add(x.href), true)));
}
