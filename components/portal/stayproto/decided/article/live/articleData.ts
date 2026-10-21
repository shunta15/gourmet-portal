import { getPlaces } from "@/lib/places";
import type { Place } from "@/lib/places/types";
import { interleave, loadStayArticles, stayLineOk, stayLine, toShop, type LiveArticle, type LivePhoto, type LiveShop } from "../../common/live";
import { EDITS, type ArticleEdit, type PhotoKind } from "./articleEdit";

/**
 * 宿の記事ページ(/stay/article/{id})の中身を、実在の宿の Place から作る(サーバー専用)。
 * 見本(1_記事)の組み立て = 最初の画面(大きな写真・見出し 2 行・副題 1 行・リード 4 行)/ 01 帯 / 02 右に写真 / 03 左に写真+右に一言 / 04 時刻の横並び / 掲載している宿 / あわせて読みたい。
 * 見本は 1 節が見出し 2 行・本文 4〜5 行しかないので、どの文を出すかは articleEdit.ts の編集表で決める(宿の ID ごと。記事の文をそのまま抜き出す)。
 * 表に無い宿は、場所の節を除いた先頭の文から自動で組み立てる(下の fallbackEdit)。
 * 文は Place.article の事実だけ。足さない・言い換えない(落とすだけ)。泊まった体験・モデルプラン・おすすめ・料金・評価は出さない。点検に通らない文は、その 1 文だけ落とす(stayLineOk)。
 */

export type ArtSection = {
  no: string;
  id: string;
  kicker: string;
  heading: string[];
  paras: string[];
  photo: LivePhoto | null;
  /** band = 01(横長の写真に暗い文字箱)/ right = 02(左に文・右に写真)/ left = 03(左に写真・中央に文・右に一言) */
  layout: "band" | "right" | "left";
  /** 写真の形(wide = 横長 / sq = 正方形に近い / tall = 縦長)。縦長は枠を少し高くする */
  shape: "wide" | "sq" | "tall";
  /** 03 の右の一言(記事の中の 1 文) */
  quote: string | null;
};

/** 04 の 1 点(時刻の線・宿の基本のどちらも同じ形。a = 上の金色の語 / b = 次の見出し / c = 補足) */
export type Row4Item = { a: string; b: string; c?: string };
export type Row4 = {
  /** times = 公式サイトに時刻がある点の横並び / basics = 時刻が 2 つ未満の宿の「宿の基本」の横並び */
  mode: "times" | "basics";
  no: string;
  id: string;
  kicker: string;
  heading: string[];
  note: string;
  items: Row4Item[];
};

export type ArticleView = {
  shop: LiveShop;
  /** 宿名(読みの括弧を除いたもの)と、括弧の中のカタカナの読み */
  nameMain: string;
  nameReading: string;
  /** 見出し 2 行(「福島県須賀川市の」「滝の湯旅館」) */
  h1: string[];
  /** 事実だけの 1 行(記事の見出し。点検済み。通らなければ「静岡県富士市の旅館」のような所在地+種類)。metadata の description 用 */
  headline: string;
  /** 副題 1 行(headline の 2 つめの文節) */
  sub: string;
  /** リード(導入の文から 4 行ぶん。点検済み) */
  lede: string;
  sections: ArtSection[];
  row4: Row4;
  hero: LivePhoto | null;
  /** 「掲載している宿」の写真(ヒーロー・節と重ならない写真。無ければ null) */
  infoPhoto: LivePhoto | null;
  /** 「掲載している宿」の説明(導入の最初の 1 文) */
  blurb: string;
  info: Array<{ k: string; v: string }>;
  index: Array<{ id: string; label: string }>;
  sources: Array<{ label: string; url: string }>;
  checkedAt?: string;
  related: LiveArticle[];
};

/** 文(「。」で終わる単位)に分ける。「。」の直後に閉じ括弧が続くときは切らない */
export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=。)(?![」』）)])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---- 写真の振り分け ----
// 写真の種類は stay.json の写真ごとの「種類」(外観・客室・風呂・料理・共用・景色)。まだ入っていない写真は説明(what)の言葉から見分ける。

const KIND_ALIASES: Array<[RegExp, PhotoKind]> = [
  [/外観|exterior|facade|building/i, "exterior"],
  [/客室|寝室|部屋|room|bed/i, "room"],
  [/風呂|温泉|浴|bath|onsen|spa/i, "bath"],
  [/料理|食事|ごはん|food|meal|dining|cuisine|dish/i, "food"],
  [/共用|共有|設備|施設|common|public|lobby|facility/i, "common"],
  [/景色|眺め|眺望|風景|view|scenery|landscape/i, "view"],
];
const KIND_KEYS = ["kind", "type", "category", "cat", "genre", "種類"];

/** 写真ごとの「種類」の値(キー名が違っても拾う)→ PhotoKind。無ければ "" */
function rawKind(ph: unknown): PhotoKind | "" {
  if (!ph || typeof ph !== "object") return "";
  const o = ph as Record<string, unknown>;
  for (const k of KIND_KEYS) {
    const v = o[k];
    if (typeof v !== "string" || !v.trim()) continue;
    for (const [re, kind] of KIND_ALIASES) if (re.test(v)) return kind;
  }
  return "";
}

/** 説明(what)の言葉 → 種類(最初の 1 文の主題で見る。順番が優先順) */
function kindFromWhat(whatFull: string): PhotoKind {
  const what = whatFull.split("。")[0];
  if (/風呂|湯船|浴室|浴槽|温泉|サウナ|露天/.test(what)) return "bath";
  if (/夕食|朝食|料理|膳|食事|ごはん|定食|盛られ|ランチ|ディナー|串焼き|ビュッフェ/.test(what)) return "food";
  if (/ダイニング|キッチン|食堂/.test(what)) return "food";
  if (/外観|玄関|入口|入り口|建物|建つ|正面|エントランス/.test(what)) return "exterior";
  if (/客室|寝室|ベッド|ロフト|和室|洋室|寝具|布団|居間|リビング|広間|座卓|ツイン/.test(what)) return "room";
  if (/富士山|眺め|景色|夜景|上空|空撮|山並み|湖|海と山|キャンプサイト|フリーサイト|テントとタープ|キャンピングカー/.test(what)) return "view";
  return "common";
}

type KPhoto = LivePhoto & { kind: PhotoKind; what: string };

function withKinds(shop: LiveShop, place: Place): KPhoto[] {
  const raw = new Map((place.photos ?? []).map((ph) => [ph.path, ph as unknown]));
  return shop.photos.map((p) => {
    const i = p.alt.indexOf(" — ");
    const what = i >= 0 ? p.alt.slice(i + 3) : "";
    return { ...p, what, kind: rawKind(raw.get(p.src)) || kindFromWhat(what) };
  });
}

/** 文字入りの看板・ロゴ・バナーが主役の写真(ヒーロー・帯には選ばない) */
const TEXT_LED = /文字|ロゴ|バナー|のぼり|幟|横断幕|「[^」]+」の[^、。]*看板/;
const aspect = (p: LivePhoto) => p.w / Math.max(1, p.h);
const shapeOf = (p: LivePhoto): "wide" | "sq" | "tall" => (aspect(p) >= 1.2 ? "wide" : aspect(p) >= 0.95 ? "sq" : "tall");
/** 横長 > 正方形 > 縦長 の順で、同じ形なら大きい方 */
function score(p: KPhoto): number {
  const cls = shapeOf(p) === "wide" ? 2 : shapeOf(p) === "sq" ? 1 : 0;
  return (TEXT_LED.test(p.what) ? -1e9 : 0) + cls * 1e7 + p.w * p.h;
}

/** 種類を順に見て、まだ使っていない写真のうち、その種類でいちばん良い 1 枚。どの種類にも無ければ null(説明の無い使い回しはしない) */
function pick(photos: KPhoto[], used: Set<string>, kinds: PhotoKind[], opts: { wideOnly?: boolean; notText?: boolean; minW?: number } = {}): KPhoto | null {
  for (const k of kinds) {
    const pool = photos
      .filter((p) => !used.has(p.src) && p.kind === k && (!opts.wideOnly || shapeOf(p) === "wide") && (!opts.notText || !TEXT_LED.test(p.what)) && p.w >= (opts.minW ?? 0))
      .sort((a, b) => score(b) - score(a));
    if (pool[0]) {
      used.add(pool[0].src);
      return pool[0];
    }
  }
  return null;
}

/** 節の写真: その種類 → 近い種類の順 */
const CHAIN: Record<PhotoKind, PhotoKind[]> = {
  bath: ["bath", "view", "exterior", "common"],
  food: ["food", "common", "room"],
  room: ["room", "common", "exterior"],
  common: ["common", "view", "room", "exterior", "food"],
  exterior: ["exterior", "view", "common", "room"],
  view: ["view", "exterior", "common", "room"],
};
const CHAIN_BONUS = [1.5, 0.8, 0.5];
/** 見出し・本文の語として数えない語(どの宿の写真の説明にも出る) */
const STOP_TOKENS = new Set(["サイト", "レンタル", "アクセス", "ホテル", "ペット", "タイプ", "ルーム", "オーナー", "メニュー", "ホーム", "ページ"]);

/** 見出し・本文から、写真の説明(what)と照らし合わせる語を取る(英字 2 字以上・カタカナ 3 字以上・漢字 3 字以上) */
function tokensOf(text: string): string[] {
  const out = new Set<string>();
  for (const re of [/[A-Za-z]{2,}/g, /[ァ-ヶー]{3,}/g, /[一-龠]{3,}/g]) {
    for (const m of text.match(re) ?? []) if (!STOP_TOKENS.has(m)) out.add(m.toLowerCase());
  }
  return [...out];
}

/**
 * 節の写真。候補 = その種類と近い種類の写真(まだ使っていないもの)。順位 = 説明(what)が見出しの語に当たる数 × 2 + 本文の語に当たる数 + 種類の近さ(その種類 1.5 → 近い種類 0.8・0.5・0.3)+ 形(横長 0.4・正方形 0.2)。
 * 文字入りの看板・ロゴは大きく下げる。候補が 1 枚も無いときだけ、種類の違う残りの写真から。
 */
function pickSection(photos: KPhoto[], used: Set<string>, kind: PhotoKind, head: string, body: string): KPhoto | null {
  const chain = CHAIN[kind];
  const ht = tokensOf(head);
  const bt = tokensOf(body).filter((t) => !ht.includes(t));
  const rank = (p: KPhoto): number => {
    const w = p.what.toLowerCase();
    const rel = 2 * ht.filter((t) => w.includes(t)).length + bt.filter((t) => w.includes(t)).length;
    const i = chain.indexOf(p.kind);
    const near = i < 0 ? 0 : (CHAIN_BONUS[i] ?? 0.3);
    const shape = shapeOf(p) === "wide" ? 0.4 : shapeOf(p) === "sq" ? 0.2 : 0;
    return rel + near + shape - (TEXT_LED.test(p.what) ? 5 : 0);
  };
  const free = photos.filter((p) => !used.has(p.src));
  const cands = free.filter((p) => chain.includes(p.kind));
  const pool = (cands.length > 0 ? cands : free).slice().sort((a, b) => rank(b) - rank(a) || a.w * a.h * -1 + b.w * b.h);
  const best = pool[0] ?? null;
  if (best) used.add(best.src);
  return best;
}

/**
 * ヒーロー(画面いっぱいに広がる): 景色・外観のうち、幅 1000px 以上 → 700px 以上 → 幅の指定なしの順に、それぞれ「横長 → 正方形に近いもの」。
 * それも無ければ、客室・共用・風呂・料理の横長 → 縦長。文字入り(看板・のぼり・バナー)は選ばない。幅の足りない写真を広げてぼやけさせないため
 */
function pickHero(photos: KPhoto[], used: Set<string>): KPhoto | null {
  const nearSquare = photos.filter((p) => aspect(p) >= 0.95);
  for (const minW of [1000, 700, 0]) {
    const hit = pick(photos, used, ["view", "exterior"], { wideOnly: true, notText: true, minW }) ?? pick(nearSquare, used, ["view", "exterior"], { notText: true, minW });
    if (hit) return hit;
  }
  return (
    pick(photos, used, ["room", "common", "bath", "food"], { wideOnly: true, notText: true }) ??
    pick(photos, used, ["view", "exterior"], { notText: true }) ??
    pick(photos, used, ["room", "common", "bath", "food"], { notText: true })
  );
}

/** 記事のカード用の写真(外観・景色の横長)。used は呼び出しごとに新しく */
function cardPhoto(photos: KPhoto[]): LivePhoto | null {
  const used = new Set<string>();
  const p = pick(photos, used, ["exterior", "view"], { wideOnly: true, notText: true }) ?? pick(photos, used, ["room", "common"], { wideOnly: true, notText: true }) ?? pick(photos, used, ["exterior", "view", "room", "common", "bath", "food"], { notText: true });
  return p ? { src: p.src, w: p.w, h: p.h, alt: p.alt } : null;
}

// ---- 文の選び方 ----

type Pool = { all: string[]; fullText: string };

function poolOf(place: Place): Pool {
  const a = place.article;
  const parts = [a?.lede ?? "", ...(a?.sections ?? []).map((s) => s.body ?? "")];
  return { all: parts.flatMap((t) => sentences(t)), fullText: parts.join("") };
}

/** 文の頭が pre に一致する文(点検に通るものだけ)。ちょうど 1 つ見つかったときだけ返す */
function findSentence(pool: Pool, pre: string): string | null {
  const hits = pool.all.filter((s) => s.startsWith(pre));
  return hits.length === 1 && stayLineOk(hits[0]) ? hits[0] : null;
}

/** 場所・時間・予約などの案内の節(宿の情報の箱と「宿の基本」へ回す) */
const PLACE_HEAD = /^場所|利用の条件|利用のしかた|利用できる時間/;
/** 自動の組み立てで本文に出さない文(住所・電話・届出など) */
const SKIP_SENT = /住所は|電話は|〒|届出|指令|ふるさと納税/;

function kickerOf(heading: string): string {
  if (/風呂|温泉/.test(heading)) return "お風呂";
  if (/食事|料理|カフェ|レストラン|喫茶/.test(heading)) return "お食事";
  if (/客室|部屋|宿|棟|コテージ|サイト|ログ|ロッジ/.test(heading)) return "お部屋";
  if (/ペット|犬/.test(heading)) return "ペット";
  if (/設備|施設|レンタル/.test(heading)) return "設備";
  return "ご案内";
}
function kindOfHeading(heading: string): PhotoKind {
  if (/風呂|温泉/.test(heading)) return "bath";
  if (/食事|料理|カフェ|レストラン|喫茶/.test(heading)) return "food";
  if (/客室|部屋|宿|棟|コテージ|ログ|ロッジ/.test(heading)) return "room";
  if (/サイト/.test(heading)) return "view";
  return "common";
}

/** 編集表に無い宿: 場所の節を除いて 3 つまで。各節は先頭の文から 140 字まで(住所・電話などの文は飛ばす)。見出しは記事の見出しのまま */
function fallbackEdit(place: Place): ArticleEdit {
  const secs = (place.article?.sections ?? []).filter((s) => s.heading && !PLACE_HEAD.test(s.heading));
  const use = (secs.length > 0 ? secs : (place.article?.sections ?? [])).slice(0, 3);
  return {
    sections: use.map((s) => {
      const picked: string[] = [];
      let n = 0;
      for (const t of sentences(s.body ?? "")) {
        if (SKIP_SENT.test(t) || !stayLineOk(t)) continue;
        if (picked.length > 0 && n + t.length > 140) break;
        picked.push(t);
        n += t.length;
      }
      return { kicker: kickerOf(s.heading), heading: [s.heading], pick: picked.map((t) => t), kind: kindOfHeading(s.heading) };
    }),
  };
}

const httpHost = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

/** 「Wonderful Garden(ワンダフルガーデン柏)」→ 宿名 + カタカナの読み */
function splitName(name: string): { main: string; reading: string } {
  const m = /^(.*?)\s*[（(]([ァ-ヶー・\s一-龠]+)[）)]$/.exec(name.trim());
  return m && m[1] ? { main: m[1].trim(), reading: m[2].trim() } : { main: name, reading: "" };
}

/** 宿の ID から記事の表示用データを作る。宿が無い・紹介記事が無い・使える文が 1 つも無ければ null(404)。places を渡すと、その宿の集まりで作る(確認用) */
export async function loadStayArticle(id: string, given?: Place[]): Promise<ArticleView | null> {
  const places = given ?? (await getPlaces("stay"));
  const place = places.find((p) => p.id === id);
  if (!place?.article) return null;
  const shop = toShop(place);
  const a = place.article;
  const pool = poolOf(place);
  const edit = EDITS[id] ?? fallbackEdit(place);
  const photos = withKinds(shop, place);
  const used = new Set<string>();

  // ---- ヒーロー・見出し・副題・リード ----
  const hero = pickHero(photos, used);
  const { main: nameMain, reading: nameReading } = splitName(shop.name);
  const h1 = shop.area ? [`${shop.area}の`, nameMain] : [nameMain];

  // 副題 = 記事の見出し(headline)の 2 つめの文節(無ければ 1 つめ)。末尾の「。」は付けない
  const headline = stayLine(a.headline);
  const clauses = headline.split("。").map((s) => s.trim()).filter(Boolean);
  const sub = (clauses.length > 1 ? clauses[1] : (clauses[0] ?? [shop.area, shop.kindName].filter(Boolean).join("の"))).replace(/。$/, "");

  // リード = 導入の文のうち、最初の「〜にある「宿名」です」を除いた文を、130 字までの範囲で(1 文は必ず)
  const ledeSents = sentences(a.lede ?? "").filter((s) => stayLineOk(s));
  const intro = ledeSents[0] ?? "";
  const rest = ledeSents.slice(/」(\(.+\))?です。$/.test(intro) ? 1 : 0);
  const ledeOut: string[] = [];
  let ledeLen = 0;
  for (const s of rest.length > 0 ? rest : ledeSents) {
    if (ledeOut.length > 0 && ledeLen + s.length > 118) break;
    ledeOut.push(s);
    ledeLen += s.length;
  }

  // ---- 3 つの節 ----
  const LAYOUTS = ["band", "right", "left"] as const;
  const usedSent = new Set<string>();
  const sections: ArtSection[] = [];
  for (const es of edit.sections) {
    const paras = es.pick.map((pre) => findSentence(pool, pre)).filter((s): s is string => !!s && !usedSent.has(s));
    const heading = es.heading.filter((h) => stayLineOk(h));
    if (paras.length === 0 || heading.length === 0) continue;
    paras.forEach((s) => usedSent.add(s));
    const n = sections.length;
    const ph = pickSection(photos, used, es.kind, `${es.kicker}${heading.join("")}`, paras.join(""));
    sections.push({
      no: String(n + 1).padStart(2, "0"),
      id: `sy-a-s${n + 1}`,
      kicker: stayLine(es.kicker),
      heading,
      paras: [paras.join("")],
      photo: ph ? { src: ph.src, w: ph.w, h: ph.h, alt: ph.alt } : null,
      layout: LAYOUTS[n % 3],
      shape: ph ? shapeOf(ph) : "wide",
      quote: null,
    });
  }
  if (ledeOut.length === 0 && sections.length === 0) return null;
  // 一言は 03(左に写真)の右に。節が 3 つ無いときは最後の節に付けない(見本は 03 にだけある)
  const quoteSent = edit.quote ? findSentence(pool, edit.quote) : null;
  if (quoteSent && !usedSent.has(quoteSent) && sections[2]) sections[2].quote = quoteSent;

  // ---- 04: 時刻の横並び or 宿の基本 ----
  const row4No = String(sections.length + 1).padStart(2, "0");
  const times: Row4Item[] = (edit.times ?? [])
    .filter((t) => pool.fullText.includes(t.need) && stayLineOk(`${t.l}${t.s ?? ""}`))
    .slice(0, 5)
    .map((t) => ({ a: t.t, b: t.l, ...(t.s ? { c: t.s } : {}) }));
  let row4: Row4;
  if (times.length >= 2) {
    row4 = { mode: "times", no: row4No, id: "sy-a-row4", kicker: "時刻", heading: ["時間の", "ご案内"], note: "公式サイトに載っている時刻です。", items: times };
  } else {
    const items: Row4Item[] = [];
    if (shop.address) items.push({ a: "所在地", b: shop.area || shop.prefName, c: shop.address });
    if (shop.phone) items.push({ a: "電話", b: shop.phone });
    for (const b of edit.basics ?? []) {
      if (pool.fullText.includes(b.need) && stayLineOk(`${b.l}${b.t}${b.s ?? ""}`)) items.push({ a: b.l, b: b.t, ...(b.s ? { c: b.s } : {}) });
    }
    // 編集表が無い宿: 休館日・公式サイトを足す(値があるものだけ)
    if (!EDITS[id]) {
      const hol = stayLine((place as { holidays?: string }).holidays);
      if (hol) items.push({ a: "休館日", b: hol.length <= 16 ? hol : "定休日あり", ...(hol.length > 16 ? { c: hol } : {}) });
      if (shop.officialUrl) items.push({ a: "公式サイト", b: httpHost(shop.officialUrl) });
    }
    row4 = { mode: "basics", no: row4No, id: "sy-a-row4", kicker: "基本", heading: ["宿の", "基本情報"], note: "公式サイトなどで確認できた内容です。", items: items.slice(0, 5) };
  }

  // ---- 掲載している宿 ----
  const infoPh =
    pick(photos, used, ["exterior", "view", "room", "common"], { notText: true, wideOnly: true }) ??
    pick(photos, used, ["exterior", "view", "room", "common"], { notText: true }) ??
    pick(photos, used, ["room", "food", "bath"], { notText: true, wideOnly: true }) ??
    pick(photos, used, ["room", "food", "bath"], { notText: true });
  const info: Array<{ k: string; v: string }> = [];
  if (shop.kindName) info.push({ k: "種類", v: shop.kindName });
  if (shop.address) info.push({ k: "所在地", v: shop.address });
  if (shop.phone) info.push({ k: "電話", v: shop.phone });
  if (shop.officialUrl) info.push({ k: "公式サイト", v: httpHost(shop.officialUrl) });

  const index = [
    ...(ledeOut.length > 0 ? [{ id: "sy-a-lead", label: "はじめに" }] : []),
    ...sections.map((s) => ({ id: s.id, label: s.kicker || s.heading.join("") })),
    { id: row4.id, label: row4.kicker === "時刻" ? "時間のご案内" : "宿の基本" },
    { id: "sy-a-info", label: "宿の情報" },
  ];

  // あわせて読みたい: 同じ都道府県 → 同じ種類 → ほか(写真と記事のある宿。種類を順に回した並び)。写真は外観・景色の横長に差し替える
  const shops = places.map(toShop);
  const others = (await loadStayArticles(shops)).filter((x) => x.id !== id);
  const same = (x: LiveArticle) => (x.shop.pref === shop.pref ? 0 : x.shop.kind === shop.kind ? 1 : 2);
  const related = interleave(others.map((x) => x.shop))
    .map((s) => others.find((x) => x.id === s.id)!)
    .sort((x, y) => same(x) - same(y))
    .slice(0, 3)
    .map((x) => {
      const pl = places.find((p) => p.id === x.id);
      const ph = pl ? cardPhoto(withKinds(x.shop, pl)) : null;
      return ph ? { ...x, photo: ph } : x;
    });

  return {
    shop,
    nameMain,
    nameReading,
    h1,
    headline: headline || [shop.area, shop.kindName].filter(Boolean).join("の"),
    sub,
    lede: ledeOut.join(""),
    sections,
    row4,
    hero: hero ? { src: hero.src, w: hero.w, h: hero.h, alt: hero.alt } : null,
    infoPhoto: infoPh ? { src: infoPh.src, w: infoPh.w, h: infoPh.h, alt: infoPh.alt } : null,
    blurb: intro && stayLineOk(intro) ? intro : "",
    info,
    index,
    sources: (a.sources ?? []).filter((s) => /^https?:\/\//.test(s.url) && s.label),
    checkedAt: a.checkedAt,
    related,
  };
}
