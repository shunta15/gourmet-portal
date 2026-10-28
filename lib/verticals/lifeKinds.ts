/**
 * くらしの「店の種類の分け方」(オーナー決定 2026-10-28 案C)。
 * 元データ(lib/places/generated/life.json)の category はそのまま。category → 4 つの組への対応は、ここ 1 か所だけに置く。
 * 探すページの絞り込み・最初のページの種類の札・特集の札・サイト内検索の候補は、すべてこの表から作る。
 * URL の kind の値は 4 つの組の英字(visit / learn / shop / service)。旧い値(lesson・shrine-temple など category の slug)で来たら、対応する組として扱う。
 * 「その他」の組は作らない(life.json の category 7 種は、必ずどれかの組に入る。scripts/life-kind-groups-check.mjs で数える)。
 * 純関数・定数(サーバー・クライアントのどちらからも使える)。
 */

export const LIFE_KIND_GROUPS = [
  { slug: "visit", name: "出かける", note: "神社・寺・農園・占い", categories: ["shrine-temple", "flower-farm", "fortune"] },
  { slug: "learn", name: "習う", note: "教室", categories: ["lesson"] },
  { slug: "shop", name: "買う・借りる", note: "服・雑貨・工芸", categories: ["fashion-craft"] },
  { slug: "service", name: "任せる", note: "写真館・洗車", categories: ["photo-marriage", "car-repair"] },
] as const;

export type LifeKindGroup = (typeof LIFE_KIND_GROUPS)[number];
export type LifeKindSlug = LifeKindGroup["slug"];

/** category の slug → 組の slug */
export const LIFE_GROUP_OF_CATEGORY: Readonly<Record<string, LifeKindSlug>> = Object.fromEntries(
  LIFE_KIND_GROUPS.flatMap((g) => g.categories.map((c) => [c, g.slug])),
);

export const lifeGroupBySlug = (slug: string): LifeKindGroup | undefined => LIFE_KIND_GROUPS.find((g) => g.slug === slug);
export const lifeGroupOfCategory = (category: string): LifeKindGroup | undefined => lifeGroupBySlug(LIFE_GROUP_OF_CATEGORY[category] ?? "");

/** URL の kind の値 → 組の slug。組の英字はそのまま・旧い値(category の slug)は対応する組へ・知らない値は null */
export const resolveLifeKind = (value: string): LifeKindSlug | null => lifeGroupBySlug(value)?.slug ?? LIFE_GROUP_OF_CATEGORY[value] ?? null;
