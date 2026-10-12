/**
 * 「地方」の区分（北から南へ）。軽い定数だけ（import なし。サーバー・クライアント・描き起こしのスクリプト automation/illust-map/build.mjs のどれからも読める）。
 * key = URL の ?area=<key>（地域のキー ?region= とは別の名前空間。地域のキーと取り違えないよう、地域と同じ綴りは使わない）。
 * regions = lib/regions.ts の RegionKey（地域）。ここに無い地域のキーは、area.ts の groupAreaKeys が最後の「その他」に入れる（地方としては数えない）。
 * 地域と地方の対応は、キーの完全一致だけ（店の名前・住所の部分一致は使わない）。
 */
export type AreaDef = {
  key: string;
  label: string;
  en: string;
  regions: readonly string[];
  /** 地図の範囲に入れない地域（本土から遠く離れていて、入れると地図のほとんどが海になる。丸は地図の縁に寄せて出し、向きの矢印をつける） */
  inset?: readonly string[];
};

export const AREA_DEFS: readonly AreaDef[] = [
  { key: "hokkaido-tohoku", label: "北海道・東北", en: "Hokkaido / Tohoku", regions: ["hokkaido", "aomori", "iwate", "akita", "yamagata", "fukushima"] },
  { key: "kanto", label: "関東", en: "Kanto", regions: ["tokyo", "kanagawa", "saitama", "ibaraki", "tochigi", "gunma"] },
  { key: "chubu", label: "中部", en: "Chubu", regions: ["niigata", "toyama", "ishikawa", "fukui", "nagano", "gifu", "shizuoka", "nagoya"] },
  { key: "kinki", label: "近畿", en: "Kinki", regions: ["mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"] },
  { key: "chugoku-shikoku", label: "中国・四国", en: "Chugoku / Shikoku", regions: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi", "kagawa", "ehime", "kochi"] },
  { key: "kyushu-okinawa", label: "九州・沖縄", en: "Kyushu / Okinawa", regions: ["fukuoka", "saga", "nagasaki", "miyazaki", "kagoshima", "okinawa"], inset: ["okinawa"] },
];

/** 地域のキー → その地域がある地方のキー（無ければ undefined） */
export const AREA_OF_REGION: Readonly<Record<string, string>> = Object.fromEntries(AREA_DEFS.flatMap((a) => a.regions.map((r) => [r, a.key] as const)));

export const areaDefOf = (key: string): AreaDef | undefined => AREA_DEFS.find((a) => a.key === key);
