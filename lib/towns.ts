/**
 * 街（市区町村）の取り出しと、街ページ（/region/<region>/<街>）の URL 規則。
 *
 * 街の単位
 *   - 一般の市・町・村: 「鎌倉市」「菰野町」（郡は落とす: 三重郡菰野町 → 菰野町）
 *   - 東京23区: 「港区」「杉並区」
 *   - 政令指定都市: 区まで含める（「大阪市北区」「京都市中京区」）。
 *       市単位だと京都市68店・大阪市40店が1ページになり「街」として広すぎるため（PLAN.md Phase 2）。
 *   - 区が取れない政令市の住所（例: 「神戸市」だけ）は街に入れない（null を返す）。
 *
 * 純粋関数だけで書いてあり、node（automation/ のスクリプト）からも読める（相対 import のみ・型 import のみ）。
 * 街キー（lib/townIntros.ts の鍵）は `<region>/<街>`。例: "osaka/大阪市北区"
 */

/** 地域キー（RegionKey）→ 都道府県。住所に都道府県が無い店の補完と、住所との食い違い検出に使う。 */
export const PREF_BY_REGION: Record<string, string> = {
  tokyo: "東京都",
  kanagawa: "神奈川県",
  osaka: "大阪府",
  nagoya: "愛知県",
  fukuoka: "福岡県",
  shizuoka: "静岡県",
  saitama: "埼玉県",
  kyoto: "京都府",
  nara: "奈良県",
  hyogo: "兵庫県",
  hiroshima: "広島県",
  gunma: "群馬県",
  shiga: "滋賀県",
  kagoshima: "鹿児島県",
  wakayama: "和歌山県",
  hokkaido: "北海道",
  aomori: "青森県",
  iwate: "岩手県",
  akita: "秋田県",
  yamagata: "山形県",
  fukushima: "福島県",
  ibaraki: "茨城県",
  tochigi: "栃木県",
  niigata: "新潟県",
  toyama: "富山県",
  ishikawa: "石川県",
  fukui: "福井県",
  nagano: "長野県",
  gifu: "岐阜県",
  mie: "三重県",
  tottori: "鳥取県",
  shimane: "島根県",
  okayama: "岡山県",
  yamaguchi: "山口県",
  kagawa: "香川県",
  ehime: "愛媛県",
  kochi: "高知県",
  saga: "佐賀県",
  nagasaki: "長崎県",
  miyazaki: "宮崎県",
  okinawa: "沖縄県",
};

/** 政令指定都市（区まで含めて街にする）。 */
const DESIGNATED_CITIES = [
  "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市", "川崎市", "相模原市", "新潟市", "静岡市", "浜松市",
  "名古屋市", "京都市", "大阪市", "堺市", "神戸市", "岡山市", "広島市", "北九州市", "福岡市", "熊本市",
];

/**
 * 名前の途中に 市/町/村/区 を含む自治体（先頭一致で優先する）。
 * 「最初に現れる 市区町村 の字で切る」だけでは切り損ねるものだけ書く。
 * 切り損ねは build-towns.mjs が疑わしい名前（下の suspiciousTown）として警告する。
 */
const TRICKY_MUNICIPALITIES = ["東村山市", "武蔵村山市", "大和郡山市", "大町町"];

const PREF_RE = /^(北海道|東京都|大阪府|京都府|.{2,3}?県)/;

export type ParsedTown = {
  /** 都道府県（住所に無ければ region から補う） */
  pref: string;
  /** 街名（市区町村。政令市は区まで） */
  town: string;
  /** pref を住所ではなく region から補ったか */
  prefInferred: boolean;
};

/** 住所から 都道府県・街 を取り出す。取り出せなければ null。 */
export function parseTown(address: string, region?: string): ParsedTown | null {
  let a = (address || "").replace(/^〒?\s*\d{3}-?\d{4}\s*/, "").trim();
  let pref: string | null = null;
  const pm = a.match(PREF_RE);
  if (pm) {
    pref = pm[1];
    a = a.slice(pref.length);
  }
  let prefInferred = false;
  if (!pref) {
    pref = (region && PREF_BY_REGION[region]) || null;
    prefInferred = true;
  }
  if (!pref) return null;

  // 郡（三重郡菰野町 → 菰野町）。「蒲郡市」「大和郡山市」のように、郡の後ろが 市 で始まる/市を含むものは郡ではない。
  const gm = a.match(/^([^\d郡市区]{1,5}郡)(?!市)/);
  if (gm) {
    const rest = a.slice(gm[1].length);
    if (/^[^\d市区]{1,6}?[町村]/.test(rest) || TRICKY_MUNICIPALITIES.some((t) => rest.startsWith(t))) {
      a = rest;
    }
  }

  // 政令指定都市 → 市＋区
  const dc = DESIGNATED_CITIES.find((c) => a.startsWith(c));
  if (dc) {
    const wm = a.slice(dc.length).match(/^(.{1,4}?区)/);
    return wm ? { pref, town: dc + wm[1], prefInferred } : null;
  }

  const tricky = TRICKY_MUNICIPALITIES.find((t) => a.startsWith(t));
  if (tricky) return { pref, town: tricky, prefInferred };

  const m = a.match(/^(.+?[市区町村])/);
  if (!m) return null;
  let town = m[1];
  // 「大町市」「四日市市」「田村市」: 町/村/市で一度切れた直後にもう一つ 市 が続くなら、そこまでが名前
  if (/[市町村]$/.test(town) && a.charAt(town.length) === "市") town += "市";
  return { pref, town, prefInferred };
}

/** 切り損ねの疑いがある街名（automation/towns/build-towns.mjs が警告に使う）。 */
export function suspiciousTown(town: string): string | null {
  if (!/[市区町村]$/.test(town)) return "市区町村で終わらない";
  if (town.length > 8) return "長すぎる";
  if (/[0-9０-９丁目番地]/.test(town)) return "数字・丁目を含む";
  return null;
}

/** 街キー: townIntros.ts の鍵・towns.json の識別子 */
export const townKey = (region: string, town: string): string => `${region}/${town}`;

/** 街ページの URL。日本語のままパスに入れ、リンクは encodeURI 済みの href を使う。 */
export const townPath = (region: string, town: string): string => `/region/${region}/${town}`;
export const townHref = (region: string, town: string): string =>
  `/region/${region}/${encodeURIComponent(town)}`;

/** URL のセグメント（%エンコードされていることがある）を街名に戻す。 */
export function decodeTownParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export type TownGroup<T> = {
  region: string;
  town: string;
  pref: string;
  items: T[];
};

/** 店の配列を 地域×街 で束ねる。街を取り出せない店は unparsed に返す。 */
export function groupByTown<T extends { address: string; region: string }>(
  stores: T[],
): { groups: TownGroup<T>[]; unparsed: T[] } {
  const map = new Map<string, TownGroup<T>>();
  const unparsed: T[] = [];
  for (const s of stores) {
    const p = parseTown(s.address, s.region);
    if (!p) {
      unparsed.push(s);
      continue;
    }
    const key = townKey(s.region, p.town);
    let g = map.get(key);
    if (!g) {
      g = { region: s.region, town: p.town, pref: p.pref, items: [] };
      map.set(key, g);
    }
    g.items.push(s);
  }
  return { groups: [...map.values()], unparsed };
}
