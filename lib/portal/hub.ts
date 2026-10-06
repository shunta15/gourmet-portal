/**
 * 総合トップ（輪）のデータ。サーバー専用（lib/data・lib/places を読むのでクライアントから import しない）。
 * 数字はすべて実データから作る。
 *  - gourmetTotal : グルメの掲載店数（getPlaces('gourmet')）
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

/** 掲載中の業種と、いまあるページへ入れる業種（準備中でもページがあるもの）。ペット・おでかけ・ステイは入れない。 */
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
  /** 掲載がある（件数が 1 以上） */
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

  const { table, index } = packWeeks(places.map((p) => ({ id: p.id, hours: p.hours, closed: p.holidays })));
  const counts = new Array<number>(table.length).fill(0);
  for (const i of Object.values(index)) counts[i]++;
  const weeks: Week[] = [];
  const n: number[] = [];
  table.forEach((w, i) => {
    if (w) {
      weeks.push(w);
      n.push(counts[i]);
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
      live: k === "gourmet" && places.length > 0,
      enter: ENTERABLE.has(k),
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
