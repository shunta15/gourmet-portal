/**
 * 「今開いている店」の判定（純関数。サーバーでもクライアントでも動く）。
 *
 * 入力は店の案内にある「営業時間」と「定休日」の文字列。ここで週ごとの営業予定（Week）に直し、
 * 現在時刻（日本時間）に当てて 営業中 / まもなく閉店（60分以内）/ 営業時間外 / 不明 を返す。
 *
 * 方針: 読み取れないものは推測せず「不明」にする。
 *  - 営業時間の文字列は lib/openingHours.ts の parseOpeningHours で曜日・時間帯に分解する。
 *    ただし parseOpeningHours は次の書き方を取り違える（毎日・平日・祝日の「日」を日曜と読む／
 *    「日〜木」のような日曜をまたぐ範囲を逆順にする／括弧や※の中の曜日を営業日と読む／
 *    曜日の無い区切りを全曜日と読む）ので、渡す前にこちらで文字列を点検し、
 *    安全に読める形だけを渡す。読めない形（曜日が括弧や※の注記にある、曜日つきと曜日なしの区切りが混在、
 *    解析できない語が残る など）は不明にする。parseOpeningHours 自体は変えない。
 *  - 定休日は曜日・第N◯曜だけ読む。「不定休」「木曜ランチ」のように曜日で表せないものは irregular（i）として残し、
 *    営業時間内であっても「営業中」とは言い切らず不明にする（営業時間外は、休みかどうかに関わらず営業時間外）。
 *  - 祝日・臨時休業・年末年始は反映できない（画面に「臨時休業・祝日は店にご確認ください」と出す）。
 *
 * クライアントに配るのは Week（数字の配列だけ）。文字列の解析はサーバー側で行う。
 */
import { parseOpeningHours } from "../openingHours";

/** [開店(0時からの分), 閉店(分)]。閉店が 1440 を超えるときは翌日にまたがる（翌2:00 = 1560） */
export type Win = [number, number];

/** 週ごとの営業予定。d は 月〜日（0〜6）。Win[]=営業時間, []=定休日, null=その曜日は読み取れない */
export interface Week {
  d: (Win[] | null)[];
  /** 不定休など、曜日で表せない休みが案内に書かれている */
  i?: 1;
  /** 第N◯曜が休み: [曜日(0=月), [N,…]] */
  n?: [number, number[]][];
}

export type OpenState = "open" | "soon" | "closed" | "unknown";

export interface OpenResult {
  state: OpenState;
  /** open / soon のとき、閉店までの分数 */
  leftMin?: number;
}

/** まもなく閉店とみなす残り分数 */
export const SOON_MINUTES = 60;

const DAY_CHARS = "月火水木金土日";
const EN_DAY: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ───────────────────────── 現在時刻（日本時間） ───────────────────────── */

interface Clock {
  /** 月=0 … 日=6 */
  day: number;
  /** 0 時からの分 */
  minutes: number;
  /** その日が月の第何◯曜か（1〜5） */
  nth: number;
}

function clockOf(ms: number): Clock {
  const j = new Date(ms + JST_OFFSET_MS);
  return {
    day: (j.getUTCDay() + 6) % 7,
    minutes: j.getUTCHours() * 60 + j.getUTCMinutes(),
    nth: Math.floor((j.getUTCDate() - 1) / 7) + 1,
  };
}

/** 指定の日が、第N◯曜の休みに当たるか */
function nthClosed(week: Week, c: Clock): boolean {
  return !!week.n?.some(([d, list]) => d === c.day && list.includes(c.nth));
}

/** 「10月9日（金）12:00」。画面に「この時刻で判定している」ことを出すための日本時間の表記 */
export function formatJst(now: Date | number): string {
  const ms = typeof now === "number" ? now : now.getTime();
  const j = new Date(ms + JST_OFFSET_MS);
  const day = DAY_CHARS[(j.getUTCDay() + 6) % 7];
  const hh = String(j.getUTCHours()).padStart(2, "0");
  const mm = String(j.getUTCMinutes()).padStart(2, "0");
  return `${j.getUTCMonth() + 1}月${j.getUTCDate()}日（${day}）${hh}:${mm}`;
}

/* ───────────────────────── 判定 ───────────────────────── */

/**
 * 週の営業予定を、指定の時刻（日本時間）に当てる。
 * now は Date か epoch ミリ秒（どちらも絶対時刻。日本時間への換算はここで行う）。
 */
export function getOpenStatus(week: Week | null | undefined, now: Date | number): OpenResult {
  if (!week) return { state: "unknown" };
  const ms = typeof now === "number" ? now : now.getTime();
  const today = clockOf(ms);
  const yesterday = clockOf(ms - DAY_MS);

  let leftMin: number | null = null;

  // 前日から日またぎで続いている営業（例: 金曜 18:00〜翌2:00 は、土曜 1:00 にも営業中）
  const prev = week.d[yesterday.day];
  if (prev && !nthClosed(week, yesterday)) {
    for (const [, close] of prev) {
      if (close > 1440 && today.minutes < close - 1440) leftMin = Math.max(leftMin ?? 0, close - 1440 - today.minutes);
    }
  }

  // 当日の営業時間
  const own = week.d[today.day];
  const closedToday = nthClosed(week, today);
  if (own && !closedToday) {
    for (const [open, close] of own) {
      if (today.minutes >= open && today.minutes < close) leftMin = Math.max(leftMin ?? 0, close - today.minutes);
    }
  }

  if (leftMin !== null) {
    // 営業時間内。ただし不定休など曜日で表せない休みがあるときは「営業中」と言い切れない
    if (week.i) return { state: "unknown" };
    return { state: leftMin <= SOON_MINUTES ? "soon" : "open", leftMin };
  }
  // 営業時間の外。その曜日が読み取れていなければ不明、読み取れていれば営業時間外
  if (own === null && !closedToday) return { state: "unknown" };
  return { state: "closed" };
}

/** 今日の営業時間に当たるかを問わず、「開いている」とみなす状態（今開いている店だけ、の絞り込み用） */
export function isOpenState(s: OpenState): boolean {
  return s === "open" || s === "soon";
}

/* ───────────────────────── 文字列 → Week ───────────────────────── */

/** 営業時間・定休日の文字列から Week を作る。読み取れないときは week が null（reason に理由） */
export function weekFromText(hours: string | undefined | null, closed?: string | null): { week: Week | null; reason?: string } {
  const h = parseHours(hours);
  if (!h.ok) return { week: null, reason: h.reason };
  const c = parseClosed(closed);

  // 定休日は営業時間より優先（「月-土 17:00-23:00」＋「火曜休み」のような書き方）
  const apply = (days: (Win[] | null)[]) => days.map((w, day) => (c.days.has(day) ? ([] as Win[]) : w));
  const d = apply(h.days);
  // 曜日つきの区切りの後ろに曜日の無い区切りが続く書き方（「火〜日 11:30-14:00 / 18:00-22:00」）は、
  //  A: 曜日なし＝毎日（parseOpeningHours の規則）  B: 直前の曜日指定の続き
  // のどちらにも読める。定休日を引いた結果が A と B で一致するときだけ採る（食い違えば決められないので不明）。
  if (h.alt && JSON.stringify(apply(h.alt)) !== JSON.stringify(d)) return { week: null, reason: "mixed-ambiguous" };
  const week: Week = { d };
  if (c.irregular || h.irregular) week.i = 1;
  if (c.nth.length > 0) week.n = c.nth;
  return { week };
}

/** 営業予定の重複排除と連番化（同じ予定の店が多いので、クライアントへ送る量を減らす） */
export function packWeeks(entries: { id: string; hours?: string | null; closed?: string | null }[]): {
  table: (Week | null)[];
  index: Record<string, number>;
} {
  const table: (Week | null)[] = [];
  const seen = new Map<string, number>();
  const index: Record<string, number> = {};
  for (const e of entries) {
    const { week } = weekFromText(e.hours, e.closed);
    const key = JSON.stringify(week);
    let i = seen.get(key);
    if (i === undefined) {
      i = table.length;
      table.push(week);
      seen.set(key, i);
    }
    index[e.id] = i;
  }
  return { table, index };
}

/* ── 営業時間の文字列 ── */

type HoursParse =
  | { ok: true; days: (Win[] | null)[]; alt?: (Win[] | null)[]; irregular?: boolean }
  | { ok: false; reason: string };

/** 括弧の注記・※以降（読み飛ばす部分）。注記に曜日や時間帯があるときは読めないとして扱う */
const ANNOTATION_RE = /\([^()]*\)|[【\[][^】\]]*[】\]]|※.*$/g;
/** 「日」「月」を含むが曜日ではない語（注記の曜日検査から除く） */
const NON_DAY_WORDS_RE = /祝前日|祝日|翌日|毎日|平日|休日|営業日|定休日|当日|本日|日替わり|日中|日没|月末|毎月|今月|来月|月間|年月日|日付|毎週|週末/g;
const TIME_RE = /(?:翌)?(\d{1,2}):(\d{2})\s*[-~]\s*(?:翌)?(\d{1,2}):(\d{2})/g;
/** 時間帯や曜日の前後に付く、意味を持たない語（営業時間の構造に影響しない） */
/** ラストオーダーの時刻（営業時間の構造には影響しない）。括弧の外に書かれていても読み飛ばす */
const LAST_ORDER_RE = /(?:料理|ドリンク|フード|コーヒー)?\s*(?:L\.?O\.?|ラストオーダー)\s*(?:料理|ドリンク|フード|コーヒー)?\s*翌?\d{1,2}:\d{2}/g;
const LABEL_RE = /ランチタイム|ディナータイム|ランチ|ディナー|モーニング|ブランチ|カフェタイム|カフェ|バータイム|バー|昼の部|夜の部|昼|夜|朝|通し|営業時間|営業|通常|OPEN|CLOSE|open|close|L\.?O\.?|ラストオーダー|料理|ドリンク|フード/g;

function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[〜～–—−]/g, "~")
    .replace(new RegExp(`([${DAY_CHARS}])\\s*-\\s*([${DAY_CHARS}])`, "g"), "$1~$2") // 月-土 → 月~土
    .replace(/[、；;]/g, "/")
    .replace(/曜日/g, "曜");
}

/**
 * 営業時間の注記が「読み飛ばして安全」か。ラストオーダー（L.O. 22:00 など）だけを安全とし、
 * それ以外（括弧の中の曜日・時間帯・「異なる」「変動」「のみ」など営業時間を変える語）は読めないものとして扱う。
 */
function hoursAnnotationSafe(a: string): boolean {
  const body = a.replace(/^[(【\[※]|[)】\]]$/g, "");
  const left = body
    .replace(LAST_ORDER_RE, "")
    .replace(/(?:L\.?O\.?|ラストオーダー)\s*(?:各\d+時間前)?/g, "")
    .replace(/モーニング|ランチ|ディナー|ブランチ|カフェ|ティータイム|Bar|BAR/g, "") // 時間帯の呼び名だけの括弧
    .replace(/[\s,/・:\d~]|料理|ドリンク|フード|コーヒー|翌/g, "");
  return left === "";
}

/** 定休日の注記が安全か。曜日（祝日などの語を除いた後に残る）や、条件を変える語を含むと、休みの条件を読み切れない */
function closedAnnotationSafe(a: string): boolean {
  const rest = a.replace(NON_DAY_WORDS_RE, "");
  if (new RegExp(`[${DAY_CHARS}]`).test(rest)) return false;
  if (/異なる|変動|変更|要確認|不定|場合あり|ランチ|ディナー|のみ|予約|貸切|イベント|短縮/.test(rest)) return false;
  return true;
}

function parseHours(raw: string | undefined | null): HoursParse {
  if (!raw || !raw.trim()) return { ok: false, reason: "no-hours" };
  let t = normalize(raw);

  // 注記を取り除く（取り除く前に安全か点検）
  for (const m of t.matchAll(ANNOTATION_RE)) {
    if (!hoursAnnotationSafe(m[0])) return { ok: false, reason: "annotation" };
  }
  t = t.replace(ANNOTATION_RE, " ").replace(LAST_ORDER_RE, " ");

  // 曜日の「日」を含む語を、parseOpeningHours が誤読しない形にそろえる
  t = t
    .replace(/平日/g, "月~金")
    .replace(/週末/g, "土日")
    .replace(/祝前日|祝前後|祝日|祝前|祝後/g, "祝")
    .replace(/毎日/g, " ")
    .replace(/曜/g, "");

  // 曜日の範囲（月~金、日~木 など）は、こちらで曜日の並びに展開してから parseOpeningHours へ渡す
  // （parseOpeningHours は日曜をまたぐ範囲を逆順に読むため）
  t = t.replace(new RegExp(`([${DAY_CHARS}])~([${DAY_CHARS}])`, "g"), (_m, a: string, b: string) => expandRange(a, b));

  const segs = t.split(/\s*\/\s*/).filter((s) => s.trim());
  if (segs.length === 0) return { ok: false, reason: "no-hours" };

  type Seg = { hasDay: boolean; specs: Array<Record<string, unknown>>; undayed: Array<Record<string, unknown>> };
  const parsed: Seg[] = [];
  let irregular = false;
  for (const seg of segs) {
    const times = Array.from(seg.matchAll(TIME_RE));
    if (times.length === 0) {
      // 時間帯の無い区切り。年末年始などの注記は読み飛ばし、不定休は印を付け、それ以外の語が残れば読めない
      if (/^(?:年末年始|年始|年末|元日|元旦|正月|お盆)[^\d]*$/.test(seg.trim())) continue;
      if (/^不定休$|^不定期$/.test(seg.trim())) {
        irregular = true;
        continue;
      }
      const left = seg.replace(LABEL_RE, "").replace(/[\s・,~\-:]/g, "");
      return { ok: false, reason: left ? "no-time" : "empty-seg" };
    }
    // 時間帯・ラベルを除いた残りが「曜日の指定」だけであること
    const dayPart = seg
      .replace(TIME_RE, " ")
      .replace(LABEL_RE, " ")
      .replace(/祝/g, "")
      .replace(/[\s,・~\-]/g, "");
    if (!new RegExp(`^[${DAY_CHARS}]*$`).test(dayPart)) return { ok: false, reason: "leftover" };
    const holidayOnly = /祝/.test(seg) && dayPart === "";
    if (holidayOnly) return { ok: false, reason: "holiday-only" };
    const hasDay = dayPart !== "";
    // 区切りごとに parseOpeningHours へ渡す（曜日の並び＋時間帯だけの形に組み直す）
    const canon = `${dayPart} ${times.map((m) => m[0]).join(",")}`;
    const specs = (parseOpeningHours(canon) ?? []) as Array<Record<string, unknown>>;
    if (specs.length === 0) return { ok: false, reason: "parser-empty" };
    parsed.push({ hasDay, specs, undayed: [] });
  }
  if (parsed.length === 0) return { ok: false, reason: "no-hours" };

  const anyDay = parsed.some((p) => p.hasDay);
  const allDay = parsed.every((p) => p.hasDay);
  const mixed = anyDay && !allDay;
  // 曜日なしの区切りが曜日つきの区切りより前にあると、どの曜日の分か決められない
  if (mixed && !parsed[0].hasDay) return { ok: false, reason: "mixed" };

  // B の読み: 曜日なしの区切りは、直前の曜日つき区切りの曜日を引き継ぐ
  if (mixed) {
    let last: string[] = [];
    for (const p of parsed) {
      if (p.hasDay) last = Array.from(new Set(p.specs.flatMap((sp) => sp.dayOfWeek as string[])));
      else p.undayed = p.specs.map((sp) => ({ ...sp, dayOfWeek: last }));
    }
  }

  const build = (variant: "a" | "b"): Win[][] | null => {
    const days: Win[][] = [[], [], [], [], [], [], []];
    for (const p of parsed) {
      const specs = variant === "b" && !p.hasDay && mixed ? p.undayed : p.specs;
      for (const spec of specs) {
        const opens = toMin(String(spec.opens));
        let closes = toMin(String(spec.closes));
        if (opens === null || closes === null || opens >= 1440 || closes === opens) return null;
        if (closes < opens) closes += 1440; // 日またぎ（翌0:00・翌2:00 など）
        for (const en of spec.dayOfWeek as string[]) {
          const di = EN_DAY[en];
          if (di !== undefined) days[di].push([opens, closes]);
        }
      }
    }
    return days;
  };
  const a = build("a");
  if (!a) return { ok: false, reason: "time" };
  // 曜日つきの案内で、載っていない曜日は「読み取れない」（定休日の欄で休みと分かれば後で休みになる）
  const fin = (days: Win[][]): (Win[] | null)[] => days.map((w) => (w.length === 0 ? (anyDay ? null : []) : merge(w)));
  const outA = fin(a);
  if (outA.every((w) => !w || w.length === 0)) return { ok: false, reason: "empty" };
  const res: HoursParse = { ok: true, days: outA };
  if (irregular) res.irregular = true;
  if (mixed) {
    const b = build("b");
    if (!b) return { ok: false, reason: "time" };
    res.alt = fin(b);
  }
  return res;
}

/** 月~水 → 月火水。日~木（日曜をまたぐ）→ 日月火水木 */
function expandRange(a: string, b: string): string {
  const i = DAY_CHARS.indexOf(a);
  const j = DAY_CHARS.indexOf(b);
  if (i <= j) return DAY_CHARS.slice(i, j + 1);
  // 日（6）から始まる範囲は、日曜から週頭へ折り返す。月〜土の逆順（土~月 など）は決められない
  if (i === 6) return "日" + DAY_CHARS.slice(0, j + 1);
  return a + b;
}

function toMin(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const v = +m[1] * 60 + +m[2];
  return +m[2] < 60 && v <= 36 * 60 ? v : null;
}

function merge(w: Win[]): Win[] {
  const s = [...w].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out: Win[] = [];
  for (const x of s) {
    const last = out[out.length - 1];
    if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
    else out.push([x[0], x[1]]);
  }
  return out;
}

/* ── 定休日の文字列 ── */

interface ClosedParse {
  days: Set<number>;
  nth: [number, number[]][];
  irregular: boolean;
}

function parseClosed(raw: string | undefined | null): ClosedParse {
  const out: ClosedParse = { days: new Set(), nth: [], irregular: false };
  if (!raw || !raw.trim()) return out;
  let t = normalize(raw);

  // 括弧の注記: 曜日や時間帯を含むと、休みの条件を読み切れない
  for (const m of t.matchAll(ANNOTATION_RE)) {
    if (!closedAnnotationSafe(m[0])) out.irregular = true;
  }
  t = t.replace(ANNOTATION_RE, " ");

  // 第N◯曜（第2・4火曜）
  t = t.replace(new RegExp(`第\\s*([1-5](?:[・,]?[1-5])*)\\s*([${DAY_CHARS}])`, "g"), (_m, ns: string, day: string) => {
    const list = ns.replace(/[・,]/g, "").split("").map(Number);
    out.nth.push([DAY_CHARS.indexOf(day), list]);
    return " ";
  });

  t = t.replace(/祝前日|祝日|祝前|祝後/g, "祝").replace(/曜/g, "");
  t = t.replace(new RegExp(`([${DAY_CHARS}])~([${DAY_CHARS}])`, "g"), (_m, a2: string, b2: string) => expandRange(a2, b2));
  const tokens = t.split(/[・,/\s]+/).filter(Boolean);
  for (const tok of tokens) {
    if (/^(?:年中)?無休$|^なし$|^無し$|^定休日?(?:なし|無し)$|^休みなし$/.test(tok)) continue;
    if (/^毎週?$|^毎$/.test(tok)) continue;
    if (/^祝$/.test(tok)) continue; // 祝日は反映しない
    if (/^平日(?:定休|休み)?$/.test(tok)) {
      for (let i = 0; i < 5; i++) out.days.add(i);
      continue;
    }
    const wd = new RegExp(`^(?:毎週)?([${DAY_CHARS}]+)(?:定休日?|休み|休)?$`).exec(tok);
    if (wd) {
      for (const ch of wd[1]) out.days.add(DAY_CHARS.indexOf(ch));
      continue;
    }
    // 年末年始・お盆など年に数日の休み（曜日の判定には影響しない。画面の注記で補う）
    if (/年末年始|年始|年末|元日|元旦|正月|お盆|ゴールデンウィーク|GW|夏季休業|冬季休業/.test(tok)) continue;
    if (/^[\d~月日年のみ]+$/.test(tok) && /\d/.test(tok)) continue;
    // 不定休・曜日で表せない休み・読めない語は、曜日だけでは休みを決められない
    out.irregular = true;
  }
  return out;
}
