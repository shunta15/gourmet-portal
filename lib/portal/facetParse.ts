/**
 * 「こだわり条件で絞る」の判定に使う、文字列 → 条件の読み取り（純関数。サーバーでもテストでも動く）。
 *
 * 方針（proto-portal/FILTERS-BRIEF.md）: 店データに書いてあることだけを使い、読み取れないものは推測せず「不明」（null）にする。
 *  - 予算 … budget の文字列。帯は「書いてある上限」で決める（上限が無ければ下限）。昼と夜があれば夜の値、夜が無ければ昼。
 *  - 席数 … seats の文字列。数字が読めた店だけ。
 *  - 営業時間帯 … lib/portal/openNow の Week（週の営業予定）から。
 *  - 設備・特徴 … tags・desc・body（lib/portal/facetRow.ts の featureTexts）。その語が肯定の文脈で書いてある店だけ「記載あり」。
 *    否定（ありません・なし・不可 など）は拾わない。「いいえ」は作らない（書いていない＝不明）。
 *
 * 外部への依存は型だけ（openNow の Week）。拡張子なしの相対 import を使わないので、そのまま node で読み込める。
 */
import type { Week } from "./openNow";

/* ───────────────────────── 予算 ───────────────────────── */

/** 予算の帯（上限の円）。最後の帯は 10,001 円〜 */
export const BUDGET_BAND_MAX = [1000, 3000, 5000, 10000] as const;
export type BudgetBand = 0 | 1 | 2 | 3 | 4;

/** 帯の番号（0=〜1,000 / 1=〜3,000 / 2=〜5,000 / 3=〜10,000 / 4=10,001〜） */
export function bandOfYen(yen: number): BudgetBand {
  for (let i = 0; i < BUDGET_BAND_MAX.length; i++) if (yen <= BUDGET_BAND_MAX[i]) return i as BudgetBand;
  return 4;
}

/** 括弧の外にある区切りだけで分ける（括弧の中の「/」「、」では分けない） */
function splitOutsideParens(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "（") depth++;
    else if (ch === ")" || ch === "）") depth = Math.max(0, depth - 1);
    if (depth === 0 && /[/／・、;；]/.test(ch)) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

/** 金額の書き方が「素直」なものだけ読む。上限があれば上限、上限が無ければ下限。読めなければ null */
function plainYen(rest: string): number | null {
  const t = rest
    .replace(/[¥円]/g, "")
    .replace(/約|前後|程度|ほど|くらい|ぐらい/g, "")
    .replace(/\s+/g, "");
  let m: RegExpExecArray | null;
  let v: number | null = null;
  if ((m = /^(\d+)~(\d+)$/.exec(t))) v = Number(m[2]); // 3000~4000 → 上限 4000
  else if ((m = /^~(\d+)$/.exec(t))) v = Number(m[1]); // 〜1500
  else if ((m = /^(\d+)~$/.exec(t))) v = Number(m[1]); // 3000〜（上限が無い → 下限）
  else if ((m = /^(\d+)以下$/.exec(t))) v = Number(m[1]);
  else if ((m = /^(\d+)$/.exec(t))) v = Number(m[1]);
  return v !== null && v > 0 && v < 1_000_000 ? v : null;
}

/**
 * 予算の文字列から、帯を決める金額（円）を取り出す。読み取れなければ null。
 *  - 昼と夜が分けて書いてあれば夜（ディナー）の値、夜が無ければ昼（ランチ）の値。
 *  - 夜（または昼）が書いてあるのに金額が読めない（「予約制」「3,000円台」「三千円台」など）ときは、他の値で代用せず null。
 *  - 「N円台」「千円」のような曖昧・漢数字、料理の単品価格・ドリンク価格は読まない（null）。
 *  - 昼夜の表示が無い値が2つ以上あるとき（「501円~1,000円/2,001円~4,000円」）は、どちらが夜か分からないので null。
 */
export function budgetYen(raw: string | undefined | null): number | null {
  if (!raw || !raw.trim()) return null;
  const s = raw
    .normalize("NFKC")
    .replace(/[〜～–—−‐]/g, "~")
    .replace(/(\d),(?=\d{3}(?!\d))/g, "$1") // 1,000 → 1000
    .replace(/(\d)\s*-\s*(\d)/g, "$1~$2") // 1000-1500 → 1000~1500
    .replace(/,/g, "、");

  type Seg = { kind: "night" | "day" | "none"; value: number | null; hasDigit: boolean };
  const segs: Seg[] = [];
  for (const raw1 of splitOutsideParens(s)) {
    // 末尾の「（昼）」「（夜）」は、前置きの表示に直す
    let seg = raw1;
    let kind: Seg["kind"] = "none";
    const tail = /[（(]\s*(昼|ランチ|夜|ディナー)\s*[）)]/.exec(seg);
    if (tail) {
      kind = tail[1] === "昼" || tail[1] === "ランチ" ? "day" : "night";
      seg = seg.replace(tail[0], "");
    }
    seg = seg.replace(/[（(][^）)]*[）)]/g, "").trim(); // ほかの括弧の注記は読み飛ばす
    const hasDigit = /\d/.test(seg);
    const night = /夜|ディナー/.test(seg);
    const day = /昼|ランチ/.test(seg);
    if (night && day) {
      segs.push({ kind: "night", value: null, hasDigit });
      continue;
    }
    if (night) kind = "night";
    else if (day) kind = "day";
    if (!hasDigit && kind === "none") continue; // 「限定数」「要確認」など、金額も昼夜も無い区切りは読み飛ばす
    const rest = seg
      .replace(/ランチタイム|ディナータイム|ランチ|ディナー|昼|夜/g, "")
      .replace(/^[はの\s]+/, "")
      .replace(/平均\s*/g, "");
    segs.push({ kind, value: hasDigit ? plainYen(rest) : null, hasDigit });
  }

  const pick = (kind: Seg["kind"]): number | null | undefined => {
    const list = segs.filter((x) => x.kind === kind);
    if (list.length === 0) return undefined; // その区分は無い
    if (list.some((x) => x.value === null)) return null;
    const vals = new Set(list.map((x) => x.value));
    return vals.size === 1 ? list[0].value : null;
  };
  const night = pick("night");
  if (night !== undefined) return night;
  const day = pick("day");
  if (day !== undefined) return segs.some((x) => x.kind === "none" && x.hasDigit) ? null : day;
  const none = segs.filter((x) => x.kind === "none" && x.hasDigit);
  return none.length === 1 ? none[0].value : null;
}

/** 予算の帯（読み取れなければ null） */
export function budgetBand(raw: string | undefined | null): BudgetBand | null {
  const y = budgetYen(raw);
  return y === null ? null : bandOfYen(y);
}

/* ───────────────────────── 席数 ───────────────────────── */

/** 席数の範囲。書いてあるのが1つの数なら min=max */
export interface SeatRange {
  min: number;
  max: number;
}

/**
 * 席数の文字列から総席数を読む。読めるのは次の形だけ（カウンター席の内訳・個室の人数・「約」「程度」などは読まない）。
 *  「26」「17席」「32席（カウンター10・テーブル22）」「50席 / 個室2室…」「10〜12席（…）」「カウンター6席のみ」
 *  「全44席。…」「総席数30席」「総26席(…)」「カウンター4席・テーブル14席(計18席)」「個室13室ほか、全100席」
 * 総席数を表す書き方が2つ以上あって数が食い違うとき（「総席数140席（現在80席で営業）」など）は読まない。
 */
export function seatRange(raw: string | undefined | null): SeatRange | null {
  if (!raw) return null;
  const s = raw.normalize("NFKC").replace(/[〜～–—−‐]/g, "~").trim();
  if (/現在|通常|最大\d/.test(s)) return null;
  let m: RegExpExecArray | null;
  const ok = (a: number, b: number): SeatRange | null => (a > 0 && b >= a && b <= 5000 ? { min: a, max: b } : null);
  const found: SeatRange[] = [];
  const add = (r: SeatRange | null) => r && found.push(r);
  if ((m = /^(\d{1,4})$/.exec(s))) add(ok(Number(m[1]), Number(m[1])));
  else if ((m = /^(\d{1,4})\s*~\s*(\d{1,4})\s*席/.exec(s))) add(ok(Number(m[1]), Number(m[2])));
  else if ((m = /^(\d{1,4})\s*席(?!\s*(?:程度|前後|ほど|くらい|ぐらい|以上|以下|弱|強))/.exec(s))) add(ok(Number(m[1]), Number(m[1])));
  // 「全44席」「総席数30席」「総26席」「計18席」「合計18席」。「テーブル計20席」のように席の種類の合計は総席数ではない
  for (const t of s.matchAll(/(?<!テーブル|カウンター|座敷|個室|席)(?:全|総席数|総|合計|計)\s*(\d{1,4})\s*席(?!\s*(?:程度|前後|ほど|くらい|ぐらい|以上|以下|弱|強))/g)) add(ok(Number(t[1]), Number(t[1])));
  if ((m = /^[^\d]{0,8}カウンター\s*(\d{1,4})\s*席のみ/.exec(s))) add(ok(Number(m[1]), Number(m[1])));
  if (found.length === 0) return null;
  const same = found.every((x) => x.min === found[0].min && x.max === found[0].max);
  return same ? found[0] : null;
}

/** 席数が threshold 席以上か。確実に以上なら true、確実に未満なら false、範囲がまたぐ・読めないときは null */
export function seatsAtLeast(r: SeatRange | null, threshold: number): boolean | null {
  if (!r) return null;
  if (r.min >= threshold) return true;
  if (r.max < threshold) return false;
  return null;
}

/* ───────────────────────── 営業時間帯 ───────────────────────── */

export interface HourFlags {
  /** いずれかの曜日の 12:00 に営業 */
  lunch: boolean | null;
  /** いずれかの曜日で 23:30 より後も営業（日をまたぐ営業を含む） */
  late: boolean | null;
  /** いずれかの曜日の 8:00 に営業 */
  morning: boolean | null;
  /** 日曜に営業時間帯がある */
  sunday: boolean | null;
}

const NOON = 12 * 60;
const LATE = 23 * 60 + 30;
const MORNING = 8 * 60;

/**
 * 週の営業予定（openNow.weekFromText が作る Week）から、営業時間帯の条件を出す。
 *  - 「はい」は、読み取れた曜日のどこかが条件に当てはまるとき。
 *  - 「いいえ」は、7曜日すべてが読み取れていて、どれも当てはまらないときだけ。読み取れない曜日が残るなら不明（null）。
 *  - 営業予定が作れない店（週が null）はすべて null。
 */
export function hourFlags(week: Week | null | undefined): HourFlags {
  if (!week) return { lunch: null, late: null, morning: null, sunday: null };
  const days = week.d;
  const allKnown = days.every((d) => d !== null);
  // 営業時間 [o, c] が、その日の t 分（または日をまたいだ翌日の t 分）に営業中か
  const covers = (o: number, c: number, t: number) => (o <= t && t < c) || (o <= t + 1440 && t + 1440 < c);
  const flag = (hit: (w: [number, number]) => boolean): boolean | null => {
    if (days.some((d) => d?.some(hit))) return true;
    return allKnown ? false : null;
  };
  const sun = days[6];
  return {
    lunch: flag(([o, c]) => covers(o, c, NOON)),
    late: flag(([, c]) => c > LATE),
    morning: flag(([o, c]) => covers(o, c, MORNING)),
    sunday: sun === null || sun === undefined ? null : sun.length > 0,
  };
}

/* ───────────────────────── 設備・特徴（記載あり） ───────────────────────── */

export const FEATURE_KEYS = ["private", "parking", "takeout", "terrace", "counter", "smokefree", "kids"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** 否定・打ち消し（キーワードの後ろ、同じ読点までに現れたら、その箇所は肯定として拾わない） */
const NEG = /ありません|ございません|ません|なし|無し|無い|ない|なく|なかっ|不可|NG|ご遠慮|禁止|おらず|おりません|非対応|未対応|お断り|できかね|[らさかせけ]ず$/;
/** 断定ではない言い方（確認・相談・問い合わせ・情報）。その箇所は肯定にも否定にも数えない */
const HEDGE = /確認|相談|問い合わせ|問合せ|情報|不明/;

interface FeatureRule {
  /** キーワード（肯定の候補になる箇所） */
  re: RegExp;
  /** 候補から外す前後の文脈 */
  skip?: (before: string, after: string, whole: string) => boolean;
}

const RULES: Record<FeatureKey, FeatureRule> = {
  // 半個室は個室に数えない。個室トイレは設備ではない
  private: { re: /(?<!半)個室/g, skip: (b, a) => /トイレ/.test(a.slice(0, 3)) || /トイレ[はが]?$/.test(b) },
  // 近隣のコインパーキング・市営駐車場など、店の駐車場ではないものは数えない
  parking: {
    re: /駐車場|駐車スペース|駐車可/g,
    skip: (b) => /(?:近隣|周辺|付近|近く|最寄り|市営|町営|県営|有料|コイン|公共)[^、。]{0,4}$/.test(b),
  },
  takeout: { re: /テイクアウト|持ち帰り|持帰り|テイクアウェイ/g },
  // 「青山テラス」のような名前（「」『』の中）、テラス喫煙所は席ではない
  terrace: {
    re: /テラス/g,
    skip: (b, a) => /[「『][^」』]*$/.test(b) || /^(?:喫煙|ハウス|モール)/.test(a),
  },
  // カウンターに料理が並ぶ、などは席ではない
  counter: { re: /カウンター/g, skip: (_b, a) => /^(?:に(?:並|置|飾|陳列|入)|の上)/.test(a) },
  smokefree: { re: /禁煙/g, skip: (b) => /(?:非|不)$/.test(b) },
  // 子連れ・家族連れ・子ども向けの設備。「お子様ランチ」「ファミリーマンション」は含まない
  kids: {
    re: /子連れ|子ども連れ|子供連れ|お子様連れ|お子さま連れ|お子様同伴|キッズ(?:ルーム|スペース|メニュー|チェア|椅子|プレート)|子ども用椅子|子供用椅子|子ども椅子|子供椅子|ベビー(?:カー|シート|ベッド|チェア|スペース)|家族連れ|ファミリー/g,
    skip: (_b, a) => /^(?:マンション|マート|レストラン)/.test(a),
  },
};

/** 喫煙できる、という記載（禁煙の記載と食い違うときは、禁煙を採らない） */
const SMOKING_ALLOWED = /喫煙(?:は|も)?(?:店内|屋内|屋外|テラス|席|スペース|ルーム)?で?(?:可|OK|できる|できます|可能|あり|有)|全席喫煙|喫煙席/;

export interface FeatureHit {
  /** 肯定の記載があった文（最初の1つ） */
  evidence: string | null;
  /** 否定の記載があった（あれば「記載あり」にしない） */
  negated: boolean;
}

/**
 * 設備・特徴を、店の文章（tags・desc・body を1つずつ並べた配列）から探す。
 * 文を読点（、）とダッシュ（――）で区切った一節ごとに、キーワードの後ろに否定が付いていないものを肯定とみなす。
 * 否定が1つでもある、または禁煙で「喫煙可」の記載もある店は「記載あり」にしない（食い違いは不明）。
 */
export function detectFeatures(texts: readonly string[]): Record<FeatureKey, FeatureHit> {
  const out = {} as Record<FeatureKey, FeatureHit>;
  for (const k of FEATURE_KEYS) out[k] = { evidence: null, negated: false };
  let smoking = false;
  for (const raw of texts) {
    if (!raw) continue;
    const text = raw.normalize("NFKC");
    for (const sentence of text.split(/[。！？\n]/)) {
      if (!sentence.trim()) continue;
      if (SMOKING_ALLOWED.test(sentence)) smoking = true;
      // 「」の中の読点では区切らない（特集記事の見出しが「…、…」と続くため）
      const clauses = sentence.split(/、(?![^「『]*[」』])|――|——|―/);
      for (const clause of clauses) {
        for (const k of FEATURE_KEYS) {
          const rule = RULES[k];
          rule.re.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = rule.re.exec(clause))) {
            const before = clause.slice(0, m.index);
            const after = clause.slice(m.index + m[0].length);
            if (rule.skip?.(before, after, clause)) continue;
            // 否定は、断定でない言い方（確認・相談など）が同じ一節にあっても拾う（肯定だけを見送る）
            if (NEG.test(after)) out[k].negated = true;
            else if (!HEDGE.test(clause) && !out[k].evidence) out[k].evidence = sentence.trim();
          }
        }
      }
    }
  }
  if (smoking) out.smokefree.negated = true;
  return out;
}

/** 「記載あり」の設備・特徴（肯定があり、否定が無いもの） */
export function featuresStated(texts: readonly string[]): FeatureKey[] {
  const hits = detectFeatures(texts);
  return FEATURE_KEYS.filter((k) => hits[k].evidence !== null && !hits[k].negated);
}
