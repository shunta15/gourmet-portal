/**
 * 総合トップ（輪）のデータ。サーバー専用（lib/data・lib/places を読むのでクライアントから import しない）。
 * 数字はすべて実データから作る。
 *  - gourmetTotal : グルメの掲載店数（getPlaces('gourmet')）
 *  - items[].count: 業種ごとの掲載店数（getPlaces(業種)）。1 以上の業種は「掲載中」（実数を出す）、0 は「掲載準備中」（items[].live）
 *  - featureTotal : 公開中（index 対象）の特集の本数（/sitemap.xml と同じ基準）
 *  - open         : 「いま営業中」を数えるための、営業予定の表。店ごとではなく、同じ予定の店をまとめた
 *                   （weeks[i] の予定の店が n[i] 軒）。営業時間が読み取れない店は含めない。判定はクライアントで現在時刻に当てる
 */
import { getPlaces } from "@/lib/places";
import { getAllFeatureArticleIdsWithUpdatedAt, isFeatureIndexable } from "@/lib/db/features";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { VERTICAL_FACE } from "./meta";
import { packWeeks, type Week } from "./openNow";

/** 輪に並べる順（時計まわり）。 */
const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/** いまあるページへ入れる業種（掲載中でも準備中でもページがあるもの）。ペット・おでかけ・ステイは入れない。「掲載中」かどうかは件数で決まる（HubItem.live）。 */
const ENTERABLE: ReadonlySet<VerticalKey> = new Set<VerticalKey>(["gourmet", "beauty", "bodycare"]);

/** スマホで名前を2行に折るときの区切り（3文字以内ずつ）。PC では折らない。 */
const LINES: Record<VerticalKey, string[]> = {
  gourmet: ["グルメ"],
  beauty: ["ビュー", "ティー"],
  bodycare: ["ボディ", "ケア"],
  pet: ["ペット"],
  leisure: ["おで", "かけ"],
  stay: ["ステイ"],
};

export interface HubItem {
  key: VerticalKey;
  name: string;
  en: string;
  glyph: string;
  path: string;
  color: string;
  light: string;
  /** 掲載中の店の数（実データを数えたもの。0 なら「掲載準備中」） */
  count: number;
  /** 掲載がある（count が 1 以上）。「掲載中」と出して、数を出す */
  live: boolean;
  /** 押して入れる（リンクにする） */
  enter: boolean;
  /** 種類の名前（業種の定義にあるもの。件数ではない） */
  cats: string[];
  /** 名前の折り返し */
  lines: string[];
}

export interface HubData {
  items: HubItem[];
  gourmetTotal: number;
  featureTotal: number;
  open: { weeks: Week[]; n: number[] };
}

export async function getHubData(): Promise<HubData> {
  const places = await getPlaces("gourmet");
  // 業種ごとの掲載数。掲載中か準備中かは、この数で決める（1 以上なら掲載中）。gourmet は上で読んだものをそのまま使う
  const counts = Object.fromEntries(
    await Promise.all(ORDER.map(async (k) => [k, k === "gourmet" ? places.length : (await getPlaces(k)).length] as const)),
  ) as Record<VerticalKey, number>;

  const { table, index } = packWeeks(places.map((p) => ({ id: p.id, hours: p.hours, closed: p.holidays })));
  const tally = new Array<number>(table.length).fill(0);
  for (const i of Object.values(index)) tally[i]++;
  const weeks: Week[] = [];
  const n: number[] = [];
  table.forEach((w, i) => {
    if (w) {
      weeks.push(w);
      n.push(tally[i]);
    }
  });

  const items: HubItem[] = ORDER.map((k) => {
    const v = VERTICALS[k];
    const f = VERTICAL_FACE[k];
    return {
      key: k,
      name: v.name,
      en: f.en,
      glyph: f.glyph,
      path: v.path,
      color: v.accent.color,
      light: v.accent.lightColor,
      count: counts[k],
      live: counts[k] > 0,
      // 掲載中の業種は、いつでも入れる（ペット・おでかけ・ステイに店が入ったら、リンクになる）
      enter: ENTERABLE.has(k) || counts[k] > 0,
      cats: v.categories.map((c) => c.name),
      lines: LINES[k],
    };
  });

  return {
    items,
    gourmetTotal: places.length,
    featureTotal: (await getAllFeatureArticleIdsWithUpdatedAt()).filter((f) => isFeatureIndexable(f.id)).length,
    open: { weeks, n },
  };
}
