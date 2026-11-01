import "server-only";
/**
 * 特集一覧 /feature(暖簾 2 の見本 5)のデータ変換(サーバー専用)。
 * 記事 = lib/data の FEATURES(シーン別まとめ + 街歩き・コース。店 1 軒の記事は並べない)。設計は components/portal/gnoren/real/featurelist/README.md。
 * 返す VM は軽い(画像は URL 文字列)。クライアントの部品は無い(アンカーと GET フォームだけ)。
 */
import { FEATURES, FEATURE_ARTICLES, REGIONS, type RegionKey } from "@/lib/data";
import type { Feature } from "@/lib/regions";
import { getFeatureCountsByRegion, getFeatureRegions, getFeaturesByRegion } from "@/lib/featureRegions";
import { cardImage, filterByTheme } from "@/lib/portal/noren/featureList";
import { isSceneShopFeature } from "@/lib/portal/noren/featureScene";
import { FEATURE_KIND_ROUNDUP, FEATURE_ROUNDUP_WALK } from "@/lib/portal/noren/featureKinds";
import { fmtDate, featureHref, imgProps } from "@/components/portal/gnoren/real/common";

export type GnFlImg = { src: string; srcSet?: string; sizes?: string };
/** 記事の札 1 枚 */
export type GnFlItem = {
  id: string;
  href: string;
  /** 札に出す題(最初の 1 文。長いときは読点で切る。全文は記事ページ) */
  title: string;
  /** 副題・導入の最初の 1 文(短く) */
  sub: string;
  img?: GnFlImg;
  /** YYYY.MM.DD(記事の date) */
  date: string;
  tag: string;
  regionName?: string;
};

/** 暖簾・カードの位置と絵柄の枠(試作の norenGeom / NOREN_CONTENT / THEMES の key) */
export type GnFlSlot = "lunch" | "cafe" | "walk" | "date" | "solo" | "family" | "area";
export type GnFlTheme = {
  /** 暖簾・カードの位置の枠 */
  slot: GnFlSlot;
  /** アイコンの種類 */
  icon: "lunch" | "cafe" | "walk" | "date" | "rain" | "family" | "area";
  /** ?theme= の値(絞り込みの名前) */
  label: string;
  /** 暖簾のラベル・カード見出し(「◯◯の特集」の◯◯) */
  head: string;
  title: string;
  desc: string;
  img?: GnFlImg;
  /** そのテーマの記事の本数 */
  total: number;
  /** 節に並べる記事の札(新しい順・最大 SECTION_CAP) */
  items: GnFlItem[];
  moreHref: string;
  /** エリア別の節だけ: 地域のリンク */
  regionLinks?: { key: string; name: string; count: number; href: string }[];
};
export type GnFlVM = {
  themes: GnFlTheme[];
  news: GnFlItem[];
  /** 注目 = 新着の 1 本目 */
  pick?: GnFlItem;
  /** 右の紙のインスタント写真(新着の 2 本目の写真) */
  polaroid?: GnFlImg;
  counts: { total: number; scene: number; walk: number; regions: number };
  /** 絞り込みがあるとき: 結果の節 */
  result?: { label: string; q: string; items: GnFlItem[] };
};
export type GnFlSP = { region?: string; theme?: string; all?: string; q?: string; tag?: string };

const SECTION_CAP = 8;

// ───────── 文の整形(純関数。作り話はしない・データの文を切るだけ) ─────────
/** 改行・「\n」を空白にして前後を整える */
const flat = (s: string): string => (s ?? "").replace(/\\n|\n/g, " ").trim();
/** 最初の 1 文(。で切る) */
function firstSentence(s: string): string {
  const t = flat(s);
  const i = t.indexOf("。");
  return (i >= 0 ? t.slice(0, i) : t).trim();
}
/**
 * max 字に収まるところまで、文(。)を頭から足していく(字は変えない。切るだけ)。
 * 1 文目だけで max を超えるときは、max 字以内の最後の読点(、)で切る(8 字以上残るとき)。無ければ max 字で切って「…」。
 */
function fit(s: string, max: number): string {
  const t = flat(s);
  if (t.length <= max) return t.replace(/。$/, "");
  const sents = t.split(/(?<=。)/).filter((x) => x.trim());
  let out = "";
  for (const x of sents) {
    if (out.length + x.length > max + 1) break;
    out += x;
  }
  if (out) return out.replace(/。$/, "");
  const head = t.slice(0, max + 1);
  const k = head.lastIndexOf("、");
  return k >= 8 ? head.slice(0, k) : `${t.slice(0, max)}…`;
}

/**
 * 布札の説明文: 記事の lede の「最初の文」(頭から。。で切る)。無ければ副題の最初の文。
 * 長いときは max 字以内の最後の読点(、)で止める(文の途中から始めない・字は変えない)。読点が無いときは文を丸ごと出す。
 */
function leadSentence(f: Feature, max: number): string {
  const a = FEATURE_ARTICLES[f.id];
  const first = firstSentence(a?.lede ?? "") || firstSentence(f.sub);
  if (first.length <= max) return first;
  const k = first.slice(0, max + 1).lastIndexOf("、");
  return k >= 8 ? first.slice(0, k) : first;
}

// ───────── テーマ(布札 7) ─────────
type ThemeDef = { slot: GnFlSlot; icon: GnFlTheme["icon"]; label: string; head: string; tags: string[] };
/**
 * 布札 7 のテーマ。どれも実在の記事が 1 本以上ある分け方(選んだ理由は real/featurelist/README.md)。
 * tags は Feature.tag の完全一致。THEME_GROUPS(lib/portal/noren/featureList.ts)と同じ名前のものは、表記ゆれ(さんぽ・子連れ)を足した集合。
 * エリア別だけ tags を持たない(地域 = getFeatureRegions)。
 */
const THEME_DEFS: ThemeDef[] = [
  { slot: "lunch", icon: "lunch", label: "ランチ", head: "ランチ", tags: ["ランチ"] },
  { slot: "cafe", icon: "cafe", label: "カフェ・朝活", head: "カフェ・朝活", tags: ["カフェ", "カフェ・朝活"] },
  { slot: "walk", icon: "walk", label: "観光・街歩き", head: "街歩き", tags: ["観光", "街歩き", "さんぽ", "散歩", "散歩・自然", "観光・博物館"] },
  { slot: "date", icon: "date", label: "デート", head: "デート", tags: ["デート"] },
  { slot: "solo", icon: "rain", label: "雨の日", head: "雨の日", tags: ["雨の日"] },
  { slot: "family", icon: "family", label: "家族・子連れ", head: "家族・子連れ", tags: ["家族", "子連れ", "ファミリー"] },
];
const AREA_LABEL = "エリア別";

const byTags = (tags: string[]): Feature[] => {
  const set = new Set(tags);
  return FEATURES.filter((f) => set.has(f.tag));
};
/** ?theme= の絞り込み。布札のテーマの名前はそのテーマの記事、それ以外は今までの THEME_GROUPS(filterByTheme) */
export function filterByGnTheme(label: string): Feature[] {
  const d = THEME_DEFS.find((x) => x.label === label);
  return d ? byTags(d.tags) : filterByTheme(label);
}

// ───────── 札 ─────────
const dateOf = (f: Feature): string => FEATURE_ARTICLES[f.id]?.date ?? "";
const newestFirst = (list: Feature[]): Feature[] =>
  list
    .map((f, i) => ({ f, i, d: dateOf(f) }))
    .sort((a, b) => b.d.localeCompare(a.d) || a.i - b.i)
    .map((x) => x.f);

function toItem(f: Feature, w = 480): GnFlItem {
  const a = FEATURE_ARTICLES[f.id];
  const src = cardImage(f);
  const rk = getFeatureRegions(f.id)[0];
  const sub = f.sub || firstSentence(a?.lede ?? "");
  return {
    id: f.id,
    href: featureHref(f.id),
    title: fit(f.title, 40),
    sub: fit(sub, 80),
    img: src ? imgProps(src, w) : undefined,
    date: fmtDate(a?.date ?? ""),
    tag: f.tag,
    regionName: rk && REGIONS[rk] ? REGIONS[rk].name : undefined,
  };
}

/** 絞り込み(今の page.tsx と同じ意味。地域・テーマ・タグ・キーワードは重ねて絞る。何も無く all=1 なら全件) */
function resolveFilter(p: GnFlSP, availableRegions: RegionKey[]): { list: Feature[]; label: string; q: string } | null {
  const region = p.region as RegionKey | undefined;
  const theme = p.theme;
  const tag = (p.tag ?? "").trim();
  const q = (p.q ?? "").trim().slice(0, 60);
  let filtered: Feature[] | null = null;
  const labels: string[] = [];
  const narrow = (list: Feature[]) => {
    if (!filtered) return list;
    const ids = new Set(list.map((f) => f.id));
    return filtered.filter((f) => ids.has(f.id));
  };
  if (region && availableRegions.includes(region)) {
    filtered = narrow(getFeaturesByRegion(region));
    labels.push(`地域: ${REGIONS[region].name}`);
  }
  if (theme) {
    filtered = narrow(filterByGnTheme(theme));
    labels.push(`テーマ: ${theme}`);
  }
  if (tag) {
    filtered = narrow(FEATURES.filter((f) => f.tag === tag));
    labels.push(`タグ: ${tag}`);
  }
  if (q) {
    const needle = q.toLowerCase();
    filtered = narrow(FEATURES.filter((f) => `${f.title} ${f.sub} ${f.kicker} ${f.tag} ${f.no}`.toLowerCase().includes(needle)));
    labels.push(`キーワード: ${q}`);
  }
  if (!filtered && p.all === "1") {
    filtered = FEATURES;
    labels.push("全件");
  }
  return filtered ? { list: filtered, label: labels.join("・"), q } : null;
}

export function getFeatureListVM(p: GnFlSP): GnFlVM {
  const counts = getFeatureCountsByRegion();
  const availableRegions = (Object.keys(REGIONS) as RegionKey[]).filter((k) => counts[k] > 0);
  const sceneCount = FEATURES.filter((f) => {
    const a = FEATURE_ARTICLES[f.id];
    return a && isSceneShopFeature(f.id, a);
  }).length;

  const news = newestFirst(FEATURES).slice(0, 5);
  const newsItems = news.map((f) => toItem(f, 400));
  const pickItem = news[0] ? { ...toItem(news[0], 1200), title: fit(news[0].title, 32) } : undefined;
  const pola = news[1] ? cardImage(news[1]) : "";

  const themes: GnFlTheme[] = THEME_DEFS.map((d) => {
    const list = newestFirst(byTags(d.tags));
    const rep = list[0];
    const repItem = rep ? toItem(rep, 640) : undefined;
    return {
      slot: d.slot,
      icon: d.icon,
      label: d.label,
      head: d.head,
      title: rep ? fit(rep.title, 26) : "",
      desc: rep ? leadSentence(rep, 64) : "",
      img: repItem?.img,
      total: list.length,
      items: list.slice(0, SECTION_CAP).map((f) => toItem(f, 400)),
      moreHref: `/feature?theme=${encodeURIComponent(d.label)}`,
    };
  });

  // エリア別: 記事の多い地域の順。各地域の新しい 1 本を札に、全地域をリンクに
  const regionsByCount = [...availableRegions].sort((a, b) => counts[b] - counts[a]);
  const areaFeatures: Feature[] = [];
  for (const k of regionsByCount.slice(0, SECTION_CAP)) {
    const first = newestFirst(getFeaturesByRegion(k))[0];
    if (first) areaFeatures.push(first);
  }
  const areaRep = areaFeatures[0] ? toItem(areaFeatures[0], 640) : undefined;
  themes.push({
    slot: "area",
    icon: "area",
    label: AREA_LABEL,
    head: AREA_LABEL,
    title: `${availableRegions.length} 地域の特集を、エリアから探す`,
    desc: `${regionsByCount.slice(0, 5).map((k) => REGIONS[k].name).join("・")}ほか。`,
    img: areaRep?.img,
    total: FEATURES.length,
    items: areaFeatures.map((f) => toItem(f, 400)),
    moreHref: "/feature?all=1",
    regionLinks: regionsByCount.map((k) => ({ key: k, name: REGIONS[k].name, count: counts[k], href: `/feature?region=${k}` })),
  });

  const fl = resolveFilter(p, availableRegions);
  return {
    themes,
    news: newsItems,
    pick: pickItem,
    polaroid: pola ? imgProps(pola, 300) : undefined,
    counts: { total: FEATURES.length, scene: sceneCount, walk: FEATURES.length - sceneCount, regions: availableRegions.length },
    result: fl ? { label: fl.label, q: fl.q, items: fl.list.map((f) => toItem(f, 400)) } : undefined,
  };
}

export const GN_FL_KIND = { scene: FEATURE_KIND_ROUNDUP, walk: FEATURE_ROUNDUP_WALK };
