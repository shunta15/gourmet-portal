/**
 * 店の案内文（Restaurant.nearest など「最寄り駅の書き方」）から、ある駅の徒歩分数を取り出す。
 *
 * storeStations.json の walkMin は、文中の最初の「徒歩N分」を、照合できた全部の駅に当てて保存している
 * （automation/stations/build-stations.mjs の extractWalkingMinutes）。
 * 例: 「矢場町駅 徒歩6分 / 栄駅 徒歩9分」→ 栄にも 6 が入る。そのまま表示すると事実と違う数字が出る。
 * そこで表示時に、駅名（または別名）が書かれている「徒歩N分」だけを案内文から取り直す。
 * 取れないときは undefined（距離から分数を計算して作ることはしない）。
 */

/** 駅名の前後に付くと「別の駅名の一部」になる文字（漢字・かな・長音など） */
const LETTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々ヶ]/u;

/** 駅名の直前に付いてよい語（路線・事業者の頭書き）。「JR大阪駅」「地下鉄烏丸御池駅」など */
const PREFIX_OK = /(?:線|地下鉄|メトロ|電鉄|電車|鉄道|電|JR|ＪＲ)$/;

/**
 * 案内文に駅名として書かれうる表記（駅エリアの名前・別名のほか、次の2つを足す）。
 *  - 市区町村名の頭を付けた別名の、頭を外した形（「京都河原町」→「河原町」。「京都市」の「京都」と一致するとき）。
 *    「東白楽」→「白楽」、「JR藤森」→「藤森」のように別の駅になる前置き（方角・事業者名）は外さない。
 *  - 「・」でつないだ駅名（「徳重・名古屋芸大」）の各部分（2文字以上）
 */
export function stationMentionNames(st: { name: string; aliases: string[]; cityName?: string | null }): string[] {
  const out = new Set<string>();
  const city = st.cityName?.match(/^(.{2,}?)[市区町村郡]/)?.[1] ?? "";
  for (const n of [st.name, ...st.aliases]) {
    out.add(n);
    if (city && n.startsWith(city) && n.length > city.length) out.add(n.slice(city.length));
    if (n.includes("・")) for (const part of n.split("・")) if (part.length >= 2) out.add(part);
  }
  return [...out];
}

/** before の中に、駅名 name が「その駅の名前として」書かれているか */
function mentions(before: string, name: string): boolean {
  if (!name) return false;
  let from = 0;
  for (;;) {
    const i = before.indexOf(name, from);
    if (i < 0) return false;
    from = i + 1;
    const prev = i > 0 ? before[i - 1] : "";
    const next = before[i + name.length] ?? "";
    const leftOk = prev === "" || !LETTER.test(prev) || PREFIX_OK.test(before.slice(0, i));
    const rightOk = next === "" || next === "駅" || !LETTER.test(next);
    if (leftOk && rightOk) return true;
  }
}

/**
 * text の中で、names（駅名・別名）のどれかが書かれた区切りに付いている「徒歩N分」を返す。
 * 区切りは「徒歩N分」ごと（直前の「徒歩N分」の終わりから今回の終わりまで）。
 * 駅エリアには複数の駅が含まれる（別名）ので、複数の区切りに当たったときは一番短い分数
 * （「その駅エリアの駅まで最短で徒歩N分」と店が書いている値）を返す。当たらなければ undefined。
 */
export function walkMinutesFromText(text: string | undefined | null, names: string[]): number | undefined {
  if (!text) return undefined;
  const re = /徒歩\s*(\d+)\s*分/g;
  const found = new Set<number>();
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const before = text.slice(start, m.index);
    start = m.index + m[0].length;
    if (names.some((n) => mentions(before, n))) found.add(parseInt(m[1], 10));
  }
  return found.size > 0 ? Math.min(...found) : undefined;
}
