/**
 * 暖簾案のデータ整形（サーバー専用）。
 * 店名・地域・駅・件数はすべて実データ（getAllRestaurants / FEATURES / REGIONS）から取る。
 * 写真だけは「ロゴ・メニュー表・看板の画像」を避けるため、店ごとに実在する写真のパスを指定している
 * （指定パスがその店の image / heroImages / gallery に無ければ、先頭の実写真にフォールバック）。
 */
import { sized } from "@/lib/imageUrl";
import { BROAD_GROUPS, matchesBroadKey } from "@/lib/cuisineBroad";

export type NRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  region: string;
  nearest: string;
  image: string;
  heroImages?: string[];
  gallery?: string[];
};

export type CatDef = {
  key: string;
  kanji: string;
  no: string;
  en: string;
  ja: string;
  note: string;
  picks: [id: string, path: string][];
};

/**
 * 暖簾の 7 つの章（和・洋・中・麺・肉・酒・茶）。章の入る店は lib/cuisineBroad.ts の大分類（業種の表記の語 + 店 ID の振り分け）。key・漢字・番号・英名・日本語名はそちらが持つ。
 * ここは、章ごとの注記と、章に並べる店（手で選んだ店 ID と写真パス。写真はその店自身の写真。指定パスがその店に無ければ先頭の実写真）。
 */
const CHAPTER_DEF: Record<string, { note: string; picks: [id: string, path: string][] }> = {
  wa: {
    note: "寿司・蕎麦・うどん・割烹・定食などの店",
    picks: [
      ["r162", "/restaurants/r162/r162-01.webp"],
      ["r195", "/restaurants/r195/r195-04.jpg"],
      ["r123", "/restaurants/r123/r123-02.jpg"],
      ["r227", "/restaurants/r227/r227-02.jpg"],
      ["r124", "/restaurants/r124/r124-02.jpg"],
      ["r100", "/restaurants/r100/r100-02.jpg"],
    ],
  },
  yo: {
    note: "イタリアン・フレンチ・ビストロ・洋食などの店",
    picks: [
      ["r50", "/restaurants/r50/r50-image-1.jpg"],
      ["r56", "/restaurants/r56/r56-mv_1.jpg"],
      ["r111", "/restaurants/r111/r111-03.jpg"],
      ["r135", "/restaurants/r135/r135-g1.jpg"],
      ["r155", "/restaurants/r155/r155-02.jpg"],
    ],
  },
  chu: {
    note: "中華・餃子・カレー・韓国・ベトナムなどの店",
    picks: [
      ["r07", "/restaurants/r07/r07-dandan-1.jpg"],
      ["r64", "/restaurants/r64/r64-02.jpg"],
      ["r125", "/restaurants/r125/r125-03.jpg"],
      ["r178", "/restaurants/r178/r178-03.jpg"],
      ["r148", "/restaurants/r148/r148-02.jpg"],
    ],
  },
  men: {
    note: "ラーメン・つけ麺・中華そば・まぜそばの店",
    picks: [
      ["r06", "/restaurants/r06/r06-hero.jpg"],
      ["r159", "/restaurants/r159/r159-04.jpg"],
      ["r90", "/restaurants/r90/r90-02.jpg"],
      ["r183", "/restaurants/r183/r183-04.jpg"],
      ["r176", "/restaurants/r176/r176-03.jpg"],
    ],
  },
  niku: {
    note: "焼肉・ホルモン・焼鳥・ステーキ・鉄板などの店",
    picks: [
      ["r128", "/restaurants/r128/r128-03.jpg"],
      ["r129", "/restaurants/r129/r129-04.jpg"],
      ["r204", "/restaurants/r204/r204-05.jpg"],
      ["r85", "/restaurants/r85/r85-02.jpg"],
      ["r76", "/restaurants/r76/r76-02.jpg"],
    ],
  },
  sake: {
    note: "居酒屋・酒場・バー・バル・ワインなどの店",
    picks: [
      ["r197", "/restaurants/r197/r197-08.jpg"],
      ["r160", "/restaurants/r160/r160-05.jpg"],
      ["r132", "/restaurants/r132/r132-03.jpg"],
      ["r75", "/restaurants/r75/r75-01.jpg"],
      ["r03", "/restaurants/paofuku-interior-wide.jpg"],
      ["r59", "/restaurants/r59/r59-03.jpg"],
    ],
  },
  cha: {
    note: "カフェ・喫茶・スイーツ・パンなどの店",
    picks: [
      ["r22", "/restaurants/r22/r22-image-1.jpg"],
      ["r215", "/restaurants/r215/r215-02.jpg"],
      ["r202", "/restaurants/r202/r202-04.jpg"],
      ["r232", "/restaurants/r232/r232-02.jpg"],
      ["r43", "/restaurants/r43/r43-image-3.jpg"],
    ],
  },
};

export const CATS: CatDef[] = BROAD_GROUPS.map((g) => ({ key: g.key, kanji: g.kanji, no: g.no, en: g.en, ja: g.label, ...CHAPTER_DEF[g.key] }));

/** 暖簾の奥に見える店の灯り（実在店の写真） */
export const HERO_PICK: [string, string] = ["r81", "/restaurants/r81/r81-01.jpg"];
/** 「いま何時」の背景に使う実在店の写真 */
export const CLOCK_PICK: [string, string] = ["r195", "/restaurants/r195/r195-01.jpg"];

export function imagesOf(r: NRestaurant): string[] {
  const all = [...(r.heroImages ?? []), ...(r.gallery ?? []), r.image].filter(Boolean);
  return Array.from(new Set(all)).filter((u) => !u.includes("tabelog"));
}

export function photoFor(r: NRestaurant, want?: string): string | null {
  const imgs = imagesOf(r);
  if (want && imgs.includes(want)) return want;
  return imgs[0] ?? null;
}

/** 「JR平塚駅より徒歩約10分」→「平塚駅」。取れなければ空 */
export function stationOf(nearest: string): string {
  const m = nearest.match(/([^\s・、／/（(〜~]{1,9}?駅)(?!前?の)/);
  if (!m) return "";
  return m[1].replace(/^(JR|地下鉄|阪急|阪神|京阪|近鉄|南海|西鉄|京急|東武|京王|小田急|東急|相鉄|名鉄|広島電鉄)/, "");
}

export type ChapterShop = {
  id: string;
  name: string;
  station: string;
  area: string;
  regionName: string;
  cuisine: string;
  img: string;
};

export type Chapter = {
  key: string;
  kanji: string;
  no: string;
  en: string;
  ja: string;
  note: string;
  count: number;
  shops: ChapterShop[];
};

export function buildChapters(rs: NRestaurant[], regionName: (k: string) => string): Chapter[] {
  const byId = new Map(rs.map((r) => [r.id, r]));
  const used = new Set<string>();
  return CATS.map((c) => {
    const count = rs.filter((r) => matchesBroadKey(c.key, r)).length;
    const shops: ChapterShop[] = [];
    for (const [id, path] of c.picks) {
      const r = byId.get(id);
      if (!r || used.has(id)) continue;
      const p = photoFor(r, path);
      if (!p) continue;
      used.add(id);
      shops.push({
        id: r.id,
        name: r.name,
        station: stationOf(r.nearest),
        area: r.area,
        regionName: regionName(r.region),
        cuisine: r.cuisine,
        img: sized(p, 1000),
      });
    }
    return { key: c.key, kanji: c.kanji, no: c.no, en: c.en, ja: c.ja, note: c.note, count, shops };
  });
}

/** エリアののぼりに透ける、各エリアの実在店の写真（[店ID, 写真パス]） */
export const REGION_PICKS: Record<string, [string, string]> = {
  osaka: ["r03", "/restaurants/paofuku-interior-wide.jpg"],
  kyoto: ["r132", "/restaurants/r132/r132-03.jpg"],
  hyogo: ["r123", "/restaurants/r123/r123-01.jpg"],
  nagoya: ["r07", "/restaurants/r07/r07-dandan-1.jpg"],
  hiroshima: ["r227", "/restaurants/r227/r227-01.jpg"],
  tokyo: ["r128", "/restaurants/r128/r128-04.jpg"],
  fukuoka: ["r196", "/restaurants/r196/r196-07.jpg"],
  saitama: ["r59", "/restaurants/r59/r59-03.jpg"],
  kanagawa: ["r90", "/restaurants/r90/r90-02.jpg"],
  nara: ["r140", "/restaurants/r140/r140-05.jpg"],
  shizuoka: ["r81", "/restaurants/r81/r81-04.jpg"],
  hokkaido: ["r239", "/restaurants/r239/r239-06.jpg"],
  shiga: ["r215", "/restaurants/r215/r215-04.jpg"],
  gunma: ["r185", "/restaurants/r185/r185-01.jpg"],
  kagoshima: ["r217", "/restaurants/r217/r217-04.jpg"],
  wakayama: ["r224", "/restaurants/r224/r224-01.jpg"],
};

export type Flag = {
  key: string;
  name: string;
  count: number;
  w: number; // css px（掲載数の平方根に比例）
  h: number; // 0.32〜1（同上）
  shop: { id: string; name: string; station: string; img: string } | null;
};

export function buildFlags(rs: NRestaurant[], regions: { key: string; name: string; count: number }[]): Flag[] {
  const byId = new Map(rs.map((r) => [r.id, r]));
  const max = Math.max(...regions.map((r) => r.count));
  return regions.map((g) => {
    const pick = REGION_PICKS[g.key];
    const r = pick ? byId.get(pick[0]) : undefined;
    const p = r ? photoFor(r, pick[1]) : null;
    const t = Math.sqrt(g.count / max);
    return {
      key: g.key,
      name: g.name,
      count: g.count,
      w: Math.round(34 + 38 * t),
      h: +(0.32 + 0.68 * t).toFixed(3),
      shop: r && p ? { id: r.id, name: r.name, station: stationOf(r.nearest), img: sized(p, 640) } : null,
    };
  });
}
