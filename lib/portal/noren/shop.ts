/**
 * 暖簾の見本（店ページ）用の純関数。サーバー・クライアントのどちらからも使える（データは読まない）。
 *  - 屋号を暖簾の布に割り振る（panelPlan）
 *  - 業種の表記から、暖簾の漢字を決める（kanjiFor）
 *  - 縦書きの店名の大きさ（nameScale）
 */

/** 暖簾に書く屋号の芯。かっこの中・「by …」・支店名（○○店）を落とし、空白でつなぐ */
export function nameCore(name: string): string {
  let s = name
    .replace(/[（(][^）)]*[）)]/g, " ")
    .replace(/[〜～~][^〜～~]*[〜～~]/g, " ")
    .replace(/\s+by\s+.*$/i, " ")
    .replace(/[-–—‐]\s*.*世界樹.*$/, " ");
  const segs = s.split(/[\s　]+/).filter(Boolean);
  // 「○○店」だけの末尾は、ほかに名前があるときは落とす（支店名）
  while (segs.length > 1 && /(支店|本店|[^\s]{1,8}店)$/.test(segs[segs.length - 1]) && segs[segs.length - 1].length <= 12) segs.pop();
  s = segs.join("");
  return s || name;
}

const LATIN_RUN = /[A-Za-z0-9&'.]+/y;

/** 字に分ける。欧文・数字の連なりは 1 つの語（横組み）として扱う。記号・長音の前後の「・」などは落とす */
export function nameTokens(core: string, maxLatin = 12): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < core.length) {
    LATIN_RUN.lastIndex = i;
    const m = LATIN_RUN.exec(core);
    if (m) {
      out.push(m[0].slice(0, maxLatin));
      i += m[0].length;
      continue;
    }
    const ch = Array.from(core.slice(i))[0];
    i += ch.length;
    if (/[\s・･·\-–—_/／|｜,，.。、!！?？♪★☆&＆「」『』"“”'’]/.test(ch)) continue;
    out.push(ch);
  }
  return out;
}

/**
 * 屋号を、布の枚数ぶんに割り振る。1 枚に 1〜2 字（欧文の語は 1 つ）。
 * PC は最大 5 枚（10 字まで）、スマホは最大 3 枚（6 字まで）。字が少なければ 1 枚 1 字。
 */
export function panelPlan(name: string, mobile: boolean): string[][] {
  const maxTok = mobile ? 6 : 10;
  const solo = mobile ? 3 : 5;
  let tokens = nameTokens(nameCore(name));
  if (tokens.length === 0) tokens = nameTokens(name);
  if (tokens.length === 0) tokens = ["輪"];
  tokens = tokens.slice(0, maxTok);
  const T = tokens.length;
  const n = T <= solo ? T : Math.ceil(T / 2);
  const per: number[] = Array(n).fill(Math.floor(T / n));
  for (let i = 0; i < T - per.reduce((a, b) => a + b, 0); i++) per[i] += 1;
  const panels: string[][] = [];
  let k = 0;
  for (const c of per) {
    panels.push(tokens.slice(k, k + c));
    k += c;
  }
  return panels;
}

const KANJI_RULES: [RegExp, string][] = [
  [/ラーメン|拉麺|らーめん|中華そば|つけ麺|担々麺|担担麺/, "麺"],
  [/寿司|鮨|すし/, "鮨"],
  [/焼肉|ホルモン|ジンギスカン|ステーキ|肉/, "肉"],
  [/居酒屋|酒場|バル|炉端|焼鳥|焼き鳥|酒|ワイン|バー|Bar/i, "酒"],
  [/蕎麦|そば|うどん/, "蕎"],
  [/カフェ|喫茶|珈琲|コーヒー|Coffee|Cafe/i, "珈"],
  [/中華|中国/, "華"],
  [/洋食|フレンチ|ビストロ|イタリアン|パスタ|ピザ|ピッツァ/, "洋"],
  [/和食|割烹|懐石|定食|天ぷら|うなぎ|海鮮/, "和"],
];

/** 暖簾・切り抜きに使う一文字。業種の表記から。当てはまらなければ屋号の最初の漢字、それも無ければ「輪」 */
export function kanjiFor(cuisine: string, name: string): string {
  for (const [re, k] of KANJI_RULES) if (re.test(cuisine)) return k;
  const han = name.match(/[一-鿿]/);
  return han ? han[0] : "輪";
}

/**
 * 縦書きの店名の組み方。長さを字数（漢字・かなは 1、欧文・数字は 0.62）で見積もり、9 字までは 1 列、18 字までは 2 列、それ以上は 3 列に割る。
 * per は 1 列に入る字数（font-size を、使える高さ ÷ per から決める）。
 */
export function nameLayout(name: string): { cols: number; per: number } {
  const text = name.replace(/\s/g, "");
  let em = 0;
  for (const ch of Array.from(text)) em += /[A-Za-z0-9]/.test(ch) ? 0.62 : 1;
  const cols = em <= 9 ? 1 : em <= 18 ? 2 : 3;
  return { cols, per: Math.max(2, Math.ceil(em / cols) + 0.4) };
}

/** 「大阪メトロ堺筋線 … 天神橋筋六丁目駅 11番出口 徒歩6分」から駅名だけ取り出す。取れなければ空 */
export function stationName(nearest: string): string {
  const m = nearest.match(/([^\s・、／/（(〜~]{1,10}?駅)(?!前?の)/);
  return m ? m[1] : "";
}

/** 使わない画像（食べログの画像・仮の画像）。表示禁止の画像（isBlockedImage）は、サーバーのページ側で別に除く */
export const isUnusableImage = (u: string | undefined | null): boolean => !u || u.includes("tabelog") || u.includes("_placeholder");

/** 店の写真の並び（今の店ページと同じ：heroImages → gallery → image）。重複・使わない画像は除く（空になることもある） */
export function heroImagesOf(r: { heroImages?: string[]; gallery?: string[]; image: string }): string[] {
  const list = r.heroImages && r.heroImages.length > 0 ? r.heroImages : r.gallery && r.gallery.length > 0 ? r.gallery : [r.image];
  return Array.from(new Set(list.filter((u) => !isUnusableImage(u))));
}
