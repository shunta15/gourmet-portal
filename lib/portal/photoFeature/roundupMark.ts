/**
 * シーン別まとめ記事の「店ごとの小さな暖簾」に染め抜く字（純関数。fs・process は使わない。軽いファイル）。
 *
 * 規則は lib/portal/photoFeature/featured.ts の GATE_UNITS（入口の暖簾の字）と同じ:
 *   ① 店名のうち屋号の核を取る（括弧の中の読みがな・説明、「業態・料理名」「支店名」は外す。外すと 1 字になるときは、業態を残す）。
 *   ② 漢字・かなは 1 字ずつ。欧文は語ごと（5 字以下の欧文だけの屋号は、1 字ずつにせず 1 語のまま。小さな暖簾は幅が狭いため）。
 *   ③ 6 つまで（それより長い屋号は、先頭から 6 つ）。
 * 染める字は、店ページの店名（記事の項目の name）の中にある字・語だけ。作った語は入れない（ROUNDUP_MARK_OVERRIDES も同じ）。
 * 店の ID（記事の項目の href /restaurant/<店 ID> の ID）の完全一致で、手で選んだ字（ROUNDUP_MARK_OVERRIDES）が優先される。店名の部分一致は使わない。
 */
export type RpUnit = {
  /** 暖簾 1 枚に染める字（漢字・かな 1 字、または欧文 1 語） */
  t: string;
  /** 幅の重み（1 字 = 1。欧文の語は字数に応じて 2〜3） */
  w: number;
};

const MAX_UNITS = 6;
const CJK = /[぀-ヿ㐀-鿿ｦ-ﾟ]/;
const LATIN_ONLY = /^[A-Za-z0-9&＆./'’:+\-éÉ]+$/;
const KATA_ONLY = /^[゠-ヿー]+$/;

const cp = (s: string) => Array.from(s);

/** 手で選んだ字: 店 ID → 染める字（店名の中にある字・語だけ。自動の取り方では屋号の核を取れない店） */
export const ROUNDUP_MARK_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  // 屋号が欧文の副題・業態の後ろに付くなど、自動の取り方では屋号の核を取れない店
  r20: ["ア", "ン", "ナ", "ン", "ブ", "ル", "ー"], // 「アンナンブルー izumi168」: 屋号はカナ。7 字（カフェレガーロと同じ扱い）
  r45: ["厨", "一", "里"], // 「産直創作鮮魚 厨 一里」: 屋号は「厨 一里」
  r413: ["Avanti"], // 「イタリアンバルAvanti」: イタリアンバルは業態
  r361: ["P", "A", "L", "L", "O"], // 「スペインバルPALLO」: スペインバルは業態（featured.ts の GATE_UNITS と同じ）
  r63: ["サ", "ン", "ペ", "イ"], // 「炭焼屋サンペイ」: 炭焼屋は業態
  r423: ["松", "寿", "司"], // 「松寿司本店」: 本店は支店名
  r406: ["こ", "ば", "や", "し"], // 「創作居酒屋こばやし」: 創作居酒屋は業態
  r472: ["天", "ノ", "松"], // 「大衆天ぷら天ノ松」: 大衆天ぷらは業態
  r55: ["ラ", "ロ", "ッ", "カ"], // 「トラットリア ラ ロッカ」: 屋号は 2 語
  r35: ["デ", "ッ", "ラ", "ノ", "ン", "ナ"], // 「トラットリア デッラ ノンナ」: 屋号は 2 語
  r40: ["Comfort", "Zone", "8"], // 「Comfort Zone 8 京いたりあん」: 京いたりあんは説明
  r368: ["や", "さ", "い", "や"], // 「「野菜が主役のレストラン」やさいやVege TABLEベジテーブル」: 「」の中は説明。屋号は「やさいや」
  r379: ["遊", "民"], // 「遊民 八王子」: 八王子は支店名
  r450: ["華", "牛", "KAGYU"], // 「個室焼肉 華牛 KAGYU」（featured.ts の GATE_UNITS と同じ）
  r38: ["マ", "コ", "チ"], // 「stand 酒場 マコチとピーナッツ」: stand 酒場は業態。長い屋号は先頭の 3 字
  r387: ["CROSSROAD"], // 「Coffee & Lunch CROSSROAD」: Coffee & Lunch は業態
  r68: ["ケ", "ン", "し", "ろ", "う"], // 「PASTA屋ケンしろう 本山本店」: PASTA屋は業態、本山本店は支店名
};

/** 欧文の語の幅の重み（小さな暖簾 1 枚に収める。1〜3 字 = 1、4〜6 字 = 2、7 字以上 = 3） */
const weightOf = (t: string) => (cp(t).length <= 3 ? 1 : cp(t).length <= 6 ? 2 : 3);

/** 文字列を、暖簾 1 枚ぶんの単位に割る（漢字・かな・カナは 1 字ずつ。欧文・数字の連なりは 1 語） */
function unitsOf(s: string): string[] {
  const out: string[] = [];
  let run = "";
  const flush = () => {
    if (run) out.push(run);
    run = "";
  };
  for (const ch of cp(s)) {
    if (CJK.test(ch)) {
      flush();
      out.push(ch);
    } else if (/[A-Za-z0-9é.\-/]/.test(ch)) {
      run += ch;
    } else {
      flush();
    }
  }
  flush();
  return out;
}

/** 店名から、屋号の核の字の並びを取る（ID の手選びが無い店の自動の取り方） */
export function autoMarkUnits(name: string): string[] {
  let s = name
    .replace(/「[^」]*」/g, " ")
    .replace(/（[^）]*）|\([^)]*\)/g, " ")
    .replace(/～[^～]*～/g, " ")
    .replace(/\s-[^-]+-\s*$/, " ")
    .replace(/[【】]/g, " ");
  s = s.replace(/[・･]/g, " ");
  let tokens = s.split(/[\s　]+/).filter(Boolean);
  // 記号だけ・数字だけの語は外す
  tokens = tokens.filter((t) => !/^[&＆\-～・+]+$/.test(t) && !/^\d+$/.test(t));
  // 支店名（〜店）は、ほかに語があるとき外す
  if (tokens.length > 1) tokens = tokens.filter((t, i) => i === 0 || !/店$/.test(t));
  if (tokens.length === 0) return unitsOf(name).slice(0, MAX_UNITS);
  let core: string[];
  if (tokens.length === 1) core = [tokens[0]];
  else if (tokens.every((t) => LATIN_ONLY.test(t))) core = tokens.slice(0, 3);
  else {
    const last = tokens[tokens.length - 1];
    const first = tokens[0];
    if (KATA_ONLY.test(last) && LATIN_ONLY.test(first)) core = [first]; // 「gennaio ジェンナイオ」: 屋号は欧文、カナは読み
    else if (cp(last).length < 2) core = [tokens[tokens.length - 2], last]; // 外すと 1 字になるときは、業態を残す
    else core = [last];
  }
  return unitsOf(core.join(" ")).slice(0, MAX_UNITS);
}

/** 店の暖簾に染める字（店 ID の手選び → 自動）。ID は店ページの ID（r20 など） */
export function storeMark(id: string, name: string): RpUnit[] {
  const manual = ROUNDUP_MARK_OVERRIDES[id];
  const units = manual ? [...manual] : autoMarkUnits(name);
  return units.map((t) => ({ t, w: CJK.test(t) ? 1 : weightOf(t) }));
}

/**
 * 入口の暖簾（WebGL の布）に染める字: その記事の利用シーンの語（Feature.tag。「接待・会食」「ランチ」など。記事のデータにある語）。
 * 中点などの記号は染めず、漢字・かな・カナを 1 字ずつ（featured.ts の GATE_UNITS と同じ。5 字以下なら 1 枚に 1 字）。
 */
export function sceneGateUnits(word: string): string[] {
  return cp(word).filter((ch) => CJK.test(ch) && ch !== "・" && ch !== "･");
}
