/**
 * 「おまかせ提案」（/omakase）の質問・選択肢・判定（純関数と定数だけ。サーバーでもクライアントでもテストでも動く）。
 * 仕様と事実の結び付けの表: proto-portal/OMAKASE-COVERAGE.md。サーバーでの表づくりは lib/portal/omakase.ts。
 *
 * 4 つの質問（どこで／誰と／予算／気分）。どの選択肢も、店のデータにある事実にだけ結び付ける。推測しない。
 *  - どこで: 店の県（グルメの region キーから lib/areas/gourmet の対応で直した県）と、その地方（lib/areas/prefectures の block）。
 *  - 誰と: 設備・特徴の判定（lib/portal/facetRow.ts。検査済みのものだけ）と、店ページに出ているタグの文字そのもの。どれか1つでも当てはまる店。
 *  - 予算: こだわり条件と同じ帯（lib/portal/facetDefs の BUDGET_BANDS。店の案内の予算の上限による）。
 *  - 気分: 店の業態の文字列（cuisine）に、選択肢ごとの語が含まれる店。語の一覧は MOODS に全部書いてある。
 * 各質問に「どれでもよい」がある。選んだ条件は、すべてを満たす店に絞る。判定できない（不明の）店は、その条件を選んだときは含めない。
 */
import { PREFECTURES, type PrefBlockName } from "@/lib/areas/prefectures";
import { BUDGET_BANDS } from "./facetDefs";

/* ───────────────────────── どこで ───────────────────────── */

export interface OmakaseRegion {
  /** URL の ?r= の値 */
  slug: string;
  block: PrefBlockName;
  label: string;
}

/** 地方（8つ。サイトの地方ブロックと同じ。表示名もサイトと同じ） */
export const OMAKASE_REGIONS: OmakaseRegion[] = [
  { slug: "hokkaido", block: "北海道", label: "北海道" },
  { slug: "tohoku", block: "東北", label: "東北" },
  { slug: "kanto", block: "関東", label: "関東" },
  { slug: "chubu", block: "中部", label: "中部" },
  { slug: "kinki", block: "近畿", label: "近畿" },
  { slug: "chugoku", block: "中国", label: "中国" },
  { slug: "shikoku", block: "四国", label: "四国" },
  { slug: "kyushu", block: "九州沖縄", label: "九州沖縄" },
];

/** 都道府県の並び（店の表の pref はこの番号） */
export const OMAKASE_PREFS = PREFECTURES.map((p) => ({ slug: p.slug, short: p.short, name: p.name, block: p.block }));
export const PREF_INDEX: Record<string, number> = Object.fromEntries(OMAKASE_PREFS.map((p, i) => [p.slug, i]));

const REGION_OF_BLOCK: Record<string, string> = Object.fromEntries(OMAKASE_REGIONS.map((r) => [r.block, r.slug]));
/** 県の番号 → 地方の slug */
export const REGION_OF_PREF: string[] = OMAKASE_PREFS.map((p) => REGION_OF_BLOCK[p.block]);

export function regionBySlug(slug: string | null | undefined): OmakaseRegion | undefined {
  return OMAKASE_REGIONS.find((r) => r.slug === slug);
}
/** 地方に属する県の番号 */
export function prefsOfRegion(slug: string): number[] {
  const out: number[] = [];
  REGION_OF_PREF.forEach((r, i) => r === slug && out.push(i));
  return out;
}

/* ───────────────────────── 誰と ───────────────────────── */

/**
 * 「誰と」の根拠になる事実（1つ1つが、店のデータにある事実）。
 *  - kind "facet": こだわり条件の判定（設備・特徴。lib/portal/facetRow.ts の has。画面に出せる＝検査済みのものだけ使う）
 *  - kind "tag":   店の tags にその文字がそのままある（店ページにタグとして出ている）
 * 並びが、店ごとの facts のビットの位置（31 個まで）。
 */
export interface FactAtom {
  id: string;
  /** 結果の店に添える文（設備は必ず「〜の記載あり」） */
  label: string;
  kind: "facet" | "tag";
  /** facet のときの条件 ID（lib/portal/facetDefs の FacetId） */
  facet?: string;
  /** tag のときの、タグの文字 */
  tag?: string;
}

const tagAtom = (tag: string): FactAtom => ({ id: `tag:${tag}`, label: `「${tag}」のタグあり`, kind: "tag", tag });

export const FACT_ATOMS: FactAtom[] = [
  { id: "counter", label: "カウンター席の記載あり", kind: "facet", facet: "counter" },
  { id: "private", label: "個室の記載あり", kind: "facet", facet: "private" },
  { id: "kids", label: "子連れ・家族連れの記載あり", kind: "facet", facet: "kids" },
  ...[
    "一人飲み",
    "一人飯",
    "ひとり飯",
    "ひとり時間",
    "デート",
    "記念日",
    "ファミリー",
    "子連れ歓迎",
    "座敷あり",
    "掘りごたつ",
    "宴会",
    "飲み放題",
    "女子会",
    "貸切",
    "貸切可",
    "貸切対応",
    "接待",
    "接待・会食",
  ].map(tagAtom),
];
export const ATOM_BIT: Record<string, number> = Object.fromEntries(FACT_ATOMS.map((a, i) => [a.id, 1 << i]));

export type WhoId = "solo" | "pair" | "family" | "group";
export interface WhoOption {
  id: WhoId;
  label: string;
  /** 選択肢の下に出す、結び付けの説明（画面にそのまま出る） */
  note: string;
  atoms: string[];
}
export const WHO_OPTIONS: WhoOption[] = [
  {
    id: "solo",
    label: "ひとりで",
    note: "カウンター席の記載がある店、「一人飲み」などのタグがある店",
    atoms: ["counter", "tag:一人飲み", "tag:一人飯", "tag:ひとり飯", "tag:ひとり時間"],
  },
  {
    id: "pair",
    label: "ふたりで",
    note: "個室の記載がある店、「デート」「記念日」のタグがある店",
    atoms: ["private", "tag:デート", "tag:記念日"],
  },
  {
    id: "family",
    label: "家族で",
    note: "子連れ・家族連れの記載がある店、座敷・掘りごたつ・「ファミリー」のタグがある店",
    atoms: ["kids", "tag:ファミリー", "tag:子連れ歓迎", "tag:座敷あり", "tag:掘りごたつ"],
  },
  {
    id: "group",
    label: "仲間・会社の人と",
    note: "「宴会」「貸切可」「飲み放題」「女子会」「接待」などのタグがある店",
    atoms: ["tag:宴会", "tag:飲み放題", "tag:女子会", "tag:貸切", "tag:貸切可", "tag:貸切対応", "tag:接待", "tag:接待・会食"],
  },
];
export const WHO_MASK: Record<WhoId, number> = Object.fromEntries(
  WHO_OPTIONS.map((w) => [w.id, w.atoms.reduce((m, a) => m | ATOM_BIT[a], 0)]),
) as Record<WhoId, number>;

/* ───────────────────────── 気分 ───────────────────────── */

export type MoodId = "men" | "niku" | "sakana" | "wa" | "yo" | "chuka" | "sake" | "kafe" | "teishoku" | "teppan";
export interface MoodOption {
  id: MoodId;
  label: string;
  /** 結び付けの説明（画面にそのまま出る） */
  note: string;
  /** 店の業態（cuisine）に、これらの語のどれかが含まれていれば当てはまる */
  words: string[];
}

/**
 * 気分 → 業態の語。CUISINE_GROUPS（/search のジャンル）の語を含み、業態の表記ゆれ（蕎麦・イタリア料理・フランス料理など）の語を足した。
 * 店の業態の文字列にその語がある店だけが当てはまる。語に合わない業態（惣菜・パン・ナイトクラブなど）は、どの気分にも入らない（「どれでもよい」では出る）。
 */
export const MOODS: MoodOption[] = [
  {
    id: "men",
    label: "麺",
    note: "ラーメン・そば・うどんの店",
    words: ["ラーメン", "担々麺", "担担麺", "まぜそば", "そば", "蕎麦", "うどん", "麺類", "焼きそば"],
  },
  {
    id: "niku",
    label: "肉",
    note: "焼肉・焼き鳥・ステーキなどの店",
    words: ["焼肉", "焼き肉", "ホルモン", "焼き鳥", "焼鳥", "串焼き", "ステーキ", "肉料理", "鳥料理", "すき焼き", "しゃぶしゃぶ", "とんかつ", "ローストビーフ"],
  },
  {
    id: "sakana",
    label: "魚",
    note: "寿司・海鮮の店",
    words: ["寿司", "鮨", "海鮮", "魚料理", "シーフード", "うなぎ"],
  },
  {
    id: "wa",
    label: "和",
    note: "和食・割烹・会席の店",
    words: ["和食", "割烹", "日本料理", "懐石", "会席", "京料理", "天ぷら", "小料理"],
  },
  {
    id: "yo",
    label: "洋",
    note: "イタリアン・フレンチ・洋食の店",
    words: ["イタリアン", "イタリア料理", "パスタ", "ピッツァ", "ピザ", "フレンチ", "フランス料理", "ビストロ", "洋食", "欧風", "スペイン料理"],
  },
  {
    id: "chuka",
    label: "中華・アジア",
    note: "中華・韓国・ベトナムなどの店",
    words: ["中華", "中国料理", "餃子", "韓国料理", "ベトナム料理", "インド料理", "中国茶"],
  },
  {
    id: "sake",
    label: "酒",
    note: "居酒屋・バー・バルの店",
    words: ["居酒屋", "酒場", "立ち飲み", "バー", "バル", "Bar"],
  },
  {
    id: "kafe",
    label: "甘味・珈琲",
    note: "カフェ・喫茶・スイーツの店",
    words: ["カフェ", "喫茶", "コーヒー", "珈琲", "紅茶", "スイーツ", "甘味", "パフェ", "ケーキ", "フルーツパーラー"],
  },
  {
    id: "teishoku",
    label: "定食・食堂",
    note: "定食・食堂・丼の店",
    words: ["定食", "食堂", "丼"],
  },
  {
    id: "teppan",
    label: "鉄板",
    note: "お好み焼き・鉄板焼きの店",
    words: ["お好み焼き", "鉄板焼き"],
  },
];
/** 語を探す前に取り除く表記（「ハンバーガー」の「バー」を酒場と取り違えない） */
const MOOD_STRIP = ["ハンバーガー"];

export function moodMaskOf(cuisine: string | undefined | null): number {
  if (!cuisine) return 0;
  let s = cuisine;
  for (const x of MOOD_STRIP) s = s.split(x).join("");
  let m = 0;
  MOODS.forEach((o, i) => {
    if (o.words.some((w) => s.includes(w))) m |= 1 << i;
  });
  return m;
}
export const MOOD_BIT: Record<MoodId, number> = Object.fromEntries(MOODS.map((o, i) => [o.id, 1 << i])) as Record<MoodId, number>;

/* ───────────────────────── 店の表と答え ───────────────────────── */

/** 店 1 軒ぶんの小さな表。[店ID, 県の番号（不明は -1）, 予算の帯（0〜4。不明は -1）, 気分のビット, 事実のビット] */
export type OmakaseRow = [id: string, pref: number, band: number, mood: number, facts: number];

export interface OmakaseData {
  rows: OmakaseRow[];
  /** 画面に出す予算の帯（BUDGET_BANDS の位置。こだわり条件と同じ基準） */
  shownBands: number[];
}

/** 答え。null = まだ答えていない、"any" = どれでもよい（場所は "all"＝どこでも） */
export interface OState {
  region: string | null;
  pref: string | null;
  who: WhoId | "any" | null;
  band: number | "any" | null;
  mood: MoodId | "any" | null;
}
export type StepId = "where" | "who" | "budget" | "mood";
export const STEPS: StepId[] = ["where", "who", "budget", "mood"];
export const EMPTY_STATE: OState = { region: null, pref: null, who: null, band: null, mood: null };

export function isAnswered(st: OState, step: StepId): boolean {
  switch (step) {
    case "where":
      return st.region !== null;
    case "who":
      return st.who !== null;
    case "budget":
      return st.band !== null;
    case "mood":
      return st.mood !== null;
  }
}
export function answeredCount(st: OState): number {
  return STEPS.filter((s) => isAnswered(st, s)).length;
}
export function isComplete(st: OState): boolean {
  return answeredCount(st) === STEPS.length;
}
/** まだ答えていない最初の質問（全部答えていれば -1） */
export function firstOpenStep(st: OState): number {
  return STEPS.findIndex((s) => !isAnswered(st, s));
}

/** 1 軒が、答えにすべて当てはまるか（skip を渡すと、その質問は無いものとして数える） */
export function rowMatches(row: OmakaseRow, st: OState, skip?: StepId): boolean {
  if (skip !== "where" && st.region !== null && st.region !== "all") {
    const pref = row[1];
    if (pref < 0) return false;
    if (st.pref !== null) {
      if (pref !== PREF_INDEX[st.pref]) return false;
    } else if (REGION_OF_PREF[pref] !== st.region) return false;
  }
  if (skip !== "who" && st.who !== null && st.who !== "any" && (row[4] & WHO_MASK[st.who]) === 0) return false;
  if (skip !== "budget" && st.band !== null && st.band !== "any" && row[2] !== st.band) return false;
  if (skip !== "mood" && st.mood !== null && st.mood !== "any" && (row[3] & MOOD_BIT[st.mood]) === 0) return false;
  return true;
}

export function matchIds(rows: OmakaseRow[], st: OState): string[] {
  const out: string[] = [];
  for (const r of rows) if (rowMatches(r, st)) out.push(r[0]);
  return out;
}

/** 質問ごとの、選択肢それぞれの店数（ほかの答えをかけた状態で、その選択肢を選んだとき） */
export interface OptionCounts {
  /** どれでもよい（その質問の条件なし） */
  any: number;
  region: Record<string, number>;
  /** 県 slug → 店数（地方を選んでいるときだけ） */
  pref: Record<string, number>;
  who: Record<string, number>;
  band: Record<number, number>;
  mood: Record<string, number>;
}

export function optionCounts(rows: OmakaseRow[], st: OState): Record<StepId, OptionCounts> {
  const blank = (): OptionCounts => ({ any: 0, region: {}, pref: {}, who: {}, band: {}, mood: {} });
  const out: Record<StepId, OptionCounts> = { where: blank(), who: blank(), budget: blank(), mood: blank() };
  for (const r of rows) {
    const [, pref, band, mood, facts] = r;
    if (rowMatches(r, st, "where")) {
      out.where.any++;
      if (pref >= 0) {
        const reg = REGION_OF_PREF[pref];
        out.where.region[reg] = (out.where.region[reg] ?? 0) + 1;
        if (st.region === reg) {
          const slug = OMAKASE_PREFS[pref].slug;
          out.where.pref[slug] = (out.where.pref[slug] ?? 0) + 1;
        }
      }
    }
    if (rowMatches(r, st, "who")) {
      out.who.any++;
      for (const w of WHO_OPTIONS) if (facts & WHO_MASK[w.id]) out.who.who[w.id] = (out.who.who[w.id] ?? 0) + 1;
    }
    if (rowMatches(r, st, "budget")) {
      out.budget.any++;
      if (band >= 0) out.budget.band[band] = (out.budget.band[band] ?? 0) + 1;
    }
    if (rowMatches(r, st, "mood")) {
      out.mood.any++;
      MOODS.forEach((o, i) => {
        if (mood & (1 << i)) out.mood.mood[o.id] = (out.mood.mood[o.id] ?? 0) + 1;
      });
    }
  }
  return out;
}

/** 条件をゆるめる案。その質問を「どれでもよい」にする（場所は、県→地方→どこでも の順にゆるめる）と何店になるか */
export interface Relax {
  step: StepId;
  /** ゆるめたあとの答え */
  next: OState;
  /** ボタンの文字（例「予算を問わない」） */
  label: string;
  count: number;
}

export function relaxations(rows: OmakaseRow[], st: OState): Relax[] {
  const out: Relax[] = [];
  const count = (s: OState) => rows.reduce((n, r) => n + (rowMatches(r, s) ? 1 : 0), 0);
  if (st.region !== null && st.region !== "all") {
    if (st.pref !== null) {
      const reg = regionBySlug(st.region);
      const next = { ...st, pref: null };
      out.push({ step: "where", next, label: `場所を「${reg?.label ?? "地方"}ぜんぶ」にする`, count: count(next) });
    } else {
      const next = { ...st, region: "all", pref: null };
      out.push({ step: "where", next, label: "場所を「どこでも」にする", count: count(next) });
    }
  }
  if (st.who !== null && st.who !== "any") {
    const next: OState = { ...st, who: "any" };
    out.push({ step: "who", next, label: "「誰と」を問わない", count: count(next) });
  }
  if (st.band !== null && st.band !== "any") {
    const next: OState = { ...st, band: "any" };
    out.push({ step: "budget", next, label: "予算を問わない", count: count(next) });
  }
  if (st.mood !== null && st.mood !== "any") {
    const next: OState = { ...st, mood: "any" };
    out.push({ step: "mood", next, label: "気分を問わない", count: count(next) });
  }
  return out;
}

/* ───────────────────────── 結果の選び方（順位ではない） ───────────────────────── */

/** 数字ではない文字列から、32bit の種を作る */
function seedOf(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 当てはまる店を、種（URL の ?s=）で決まる順に並べ替える。評価・人気は使わない。同じ種なら同じ並び（共有した URL で同じ店が出る） */
export function shuffled(ids: string[], seed: string): string[] {
  const a = [...ids].sort();
  const rand = mulberry32(seedOf(seed));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 1 ページに出す店の数 */
export const PAGE_SIZE = 3;

export function pageOf(order: string[], page: number): string[] {
  if (order.length === 0) return [];
  const pages = Math.ceil(order.length / PAGE_SIZE);
  const p = ((page % pages) + pages) % pages;
  return order.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
}

/* ───────────────────────── URL ───────────────────────── */

export interface Parsed {
  st: OState;
  /** 見直している質問（URL の ?q=1〜4 → 0〜3）。無ければ null */
  edit: number | null;
  seed: string;
  page: number;
}

type Get = (key: string) => string | null | undefined;

/**
 * URL の答えを読む。知らない値・出していない帯・地方に属さない県は、答えていないものとして捨てる。
 *   ?r=kanto|all  &p=tokyo  &who=solo|pair|family|group|any  &b=1000|3000|5000|10000|10001|any  &m={気分の id}|any  &q=1〜4  &s={種}  &n={ページ}
 */
export function parseOmakase(get: Get, shownBands: readonly number[] = [0, 1, 2, 3, 4]): Parsed {
  const r = (get("r") ?? "").trim();
  const p = (get("p") ?? "").trim();
  const who = (get("who") ?? "").trim();
  const b = (get("b") ?? "").trim();
  const m = (get("m") ?? "").trim();

  let region: string | null = null;
  let pref: string | null = null;
  if (r === "all") region = "all";
  else if (regionBySlug(r)) {
    region = r;
    if (p in PREF_INDEX && REGION_OF_PREF[PREF_INDEX[p]] === r) pref = p;
  }
  const whoV: OState["who"] = who === "any" ? "any" : WHO_OPTIONS.some((w) => w.id === who) ? (who as WhoId) : null;
  let band: OState["band"] = null;
  if (b === "any") band = "any";
  else {
    const bi = BUDGET_BANDS.findIndex((x) => String(x.value) === b);
    if (bi >= 0 && shownBands.includes(bi)) band = bi;
  }
  const mood: OState["mood"] = m === "any" ? "any" : MOODS.some((o) => o.id === m) ? (m as MoodId) : null;

  const qn = Number((get("q") ?? "").trim());
  const edit = Number.isInteger(qn) && qn >= 1 && qn <= 4 ? qn - 1 : null;
  const seed = (get("s") ?? "").trim().replace(/[^0-9a-z]/gi, "").slice(0, 12);
  const nn = Number((get("n") ?? "").trim());
  const page = Number.isInteger(nn) && nn >= 0 && nn < 10000 ? nn : 0;
  return { st: { region, pref, who: whoV, band, mood }, edit, seed, page };
}

/** 答えを URL の検索文字列にする（先頭の ? なし。空なら ""） */
export function omakaseQuery(st: OState, opts: { edit?: number | null; seed?: string; page?: number } = {}): string {
  const p = new URLSearchParams();
  if (st.region !== null) p.set("r", st.region);
  if (st.region !== null && st.region !== "all" && st.pref !== null) p.set("p", st.pref);
  if (st.who !== null) p.set("who", st.who);
  if (st.band !== null) p.set("b", st.band === "any" ? "any" : String(BUDGET_BANDS[st.band].value));
  if (st.mood !== null) p.set("m", st.mood);
  if (opts.edit !== undefined && opts.edit !== null) p.set("q", String(opts.edit + 1));
  if (opts.seed) p.set("s", opts.seed);
  if (opts.page) p.set("n", String(opts.page));
  return p.toString();
}

/* ───────────────────────── 言葉 ───────────────────────── */

/** 答えを、画面と読み上げ用の短い文字にする（まだなら null） */
export function answerText(st: OState, step: StepId): string | null {
  switch (step) {
    case "where": {
      if (st.region === null) return null;
      if (st.region === "all") return "どこでも";
      if (st.pref !== null) return OMAKASE_PREFS[PREF_INDEX[st.pref]].short;
      return `${regionBySlug(st.region)?.label ?? ""}ぜんぶ`;
    }
    case "who":
      return st.who === null ? null : st.who === "any" ? "問わない" : (WHO_OPTIONS.find((w) => w.id === st.who)?.label ?? null);
    case "budget":
      return st.band === null ? null : st.band === "any" ? "問わない" : BUDGET_BANDS[st.band].label;
    case "mood":
      return st.mood === null ? null : st.mood === "any" ? "問わない" : (MOODS.find((o) => o.id === st.mood)?.label ?? null);
  }
}

export const STEP_TITLE: Record<StepId, string> = { where: "どこで", who: "誰と", budget: "予算", mood: "気分" };
export const STEP_NUMERAL = ["壱", "弐", "参", "四"] as const;
