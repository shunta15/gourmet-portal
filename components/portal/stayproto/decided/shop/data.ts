import "server-only";
import { getPlaces } from "@/lib/places";
import type { Place, StayAttributes } from "@/lib/places/types";
import { mapsSearchUrl } from "@/lib/maps";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import { loadStayShops, stayLine, stayLineOk, visualLen, type LivePhoto, type LiveShop } from "../common/live";
import { syLinks } from "../common/site";
import { STAY_COPY, type FactBox, type PKind, type SecCopy, type ShopCopy } from "./copy";
import type { FacKey, RowIcon } from "./FacIcons";

/**
 * 宿の紹介(本番 /stay/shop/{id})に出すものを、1 軒ぶん用意する(サーバー専用)。実在の宿(getPlaces('stay'))の実在のデータだけ。
 * 値が無い欄は空にして、画面側で出さない。文は出す前に 1 文ずつ点検する(common/live.ts の stayLineOk =
 * 料金・評価・「おすすめ」「人気」・〇選・最上級・効き目や癒し・泊まった体験の言い回しを含む文は落とす)。料金・星・口コミは持たない。
 *
 * 見本「2_店舗紹介」どおりの短さ(見出し 2 行・本文 3〜4 行)の文は、宿ごとに記事の事実から書いた copy.ts を使う。無い宿は、記事の文から自動で短く取る(autoCopy)。
 * 長い説明は、各節の「〇〇の詳細を見る」で開く(記事の節の全文。detail)。
 *
 * 写真(1 軒 10〜14 枚)は、1 枚ずつの「種類」(外観・景色・客室・風呂・料理・共用)で、ヒーロー・「この宿で過ごす時間」の背景・客室・温泉(お風呂)・お食事・紹介記事に振り分ける。
 *  - 種類は、写真の記録の kind(stay.json の photos[].kind。外観/客室/風呂/料理/共用/景色。英字でも読む)があればそれ。無ければ写真の説明(what)の最初の 1 文の言葉で見分ける。
 *  - 同じ写真を同じページで 2 回は使わない。足りないときは、節の写真の枚数を減らす(形は崩れない。節に写真が 1 枚も無ければ、客室以外の節は出さない)。
 */

export type SPhoto = LivePhoto & { what: string; kind: PKind };

export type Sec = {
  slot: "a" | "b" | "c";
  /** 追従タブの飛び先 id(sh-rooms / sh-bath / sh-dining) */
  id: string;
  label: string;
  en: string;
  h: string[];
  p: string[];
  /** 「〇〇の詳細を見る」で開く全文(段落。点検済み) */
  detail: string[];
  btn: string;
  photos: SPhoto[];
};

export type Row = { k: string; v: string; note?: string; kind?: "tel" | "url"; href?: string };

export type ShopDetail = {
  shop: LiveShop;
  place: Place;
  path: string;
  schemaType: string;
  /** ヒーローの写真(最大 3 枚。1 枚目が大) */
  hero: SPhoto[];
  /** 「この宿で過ごす時間」の背景(横長の景色・外観。無ければ null) */
  banner: SPhoto | null;
  /** ヒーローの 1 行(短い事実の 1 文。無ければ空) */
  tagline: string;
  /** 右上の箱(種類・札・事実の欄) */
  panel: { cap: string; big: string; pills: string[]; boxes: FactBox[] };
  intro: { h: string[]; p: string[] };
  secs: Sec[];
  /** 施設・サービスのアイコン(事実のあるものだけ。最大 8) */
  facilities: Array<{ k: FacKey; t: string }>;
  /** 基本情報の表(値があるものだけ) */
  rows: Row[];
  /** アクセスの行(最大 3) */
  access: Array<{ icon: RowIcon; label: string; text: string }>;
  /** 「詳しいアクセス情報を見る」で開く全文 */
  accessDetail: string[];
  /** Google マップの埋め込み(キー不要)と、地図のリンク */
  mapSrc: string;
  mapHref: string;
  /** 宿の紹介記事のページ(写真のある宿だけ。無ければ null)。photo は他の欄で使っていない写真(無ければ null) */
  article: { href: string; title: string; photo: SPhoto | null } | null;
};

// ---------------------------------------------------------------- 写真の種類
const KIND_FIELD: Array<[RegExp, PKind]> = [
  [/外観|exterior|facade|outside|building/i, "exterior"],
  [/景色|景観|眺|view|scenery|landscape|nature/i, "view"],
  [/客室|部屋|room|bedroom/i, "rooms"],
  [/風呂|温泉|浴|bath|onsen|spa/i, "bath"],
  [/料理|食事|dining|food|meal|dish|cuisine/i, "dining"],
  [/共用|共有|館内|common|lobby|lounge|facility|interior|shared/i, "common"],
];
/** 写真の記録の kind(日本語でも英字でも)→ 種類。読めなければ null */
function kindFromField(raw: unknown): PKind | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  for (const [re, k] of KIND_FIELD) if (re.test(raw)) return k;
  return null;
}
/** 写真の説明(what)の最初の 1 文の言葉 → 種類(kind が無い写真の見分け方。当たらなければ other) */
const W_BATH = /温泉|露天|風呂|浴場|浴室|浴槽|湯船|サウナ/;
const W_DINING = /食事|料理|夕食|朝食|ディナー|ランチ|バーベキュー|BBQ|ごはん|ご飯|サラダ|膳|串焼き|ビュッフェ|ベーコンエッグ|トースト|レストランの店内|ラーメン|ピザ/;
const W_EXTERIOR = /外観|玄関|正面|入口|建物|看板|上空/;
const W_ROOMS = /客室|部屋|ルーム|ベッド|寝具|布団|寝室|ロフト|ツイン|和室|洋室|スイート|ドミトリー/;
const W_COMMON = /居間|リビング|広間|食堂|ダイニング|ラウンジ|ロビー|共有|共用|談話|キッチン|トイレ|ハンモック|フロント|売店|暖炉/;
const W_VIEW = /景色|眺|富士山|山|海|空|夕暮れ|夕焼け|サイト|芝|庭|敷地|森|川|滝|湖|雪|星|夜景|桜|紅葉|プール|テラス|デッキ|東屋/;
function kindFromWhat(whatFull: string): PKind {
  const what = (whatFull ?? "").split("。")[0];
  if (!what) return "other";
  if (W_BATH.test(what)) return "bath";
  if (W_DINING.test(what)) return "dining";
  if (W_EXTERIOR.test(what)) return "exterior";
  if (W_ROOMS.test(what)) return "rooms";
  if (W_COMMON.test(what)) return "common";
  if (W_VIEW.test(what)) return "view";
  return "other";
}

/** 客室の写真のうち、寝室ではなく居間・リビング・食堂・広間が写っているもの(説明の最初の 1 文で見る)は living にする */
const W_LIVING = /居間|リビング|広間|食堂|ダイニング|キッチン/;
const W_BED = /寝室|ベッド|布団|寝具|ロフト/;
function refine(kind: PKind, whatFull: string): PKind {
  if (kind !== "rooms") return kind;
  const w = (whatFull ?? "").split("。")[0];
  return W_LIVING.test(w) && !W_BED.test(w) ? "living" : kind;
}

const ratio = (p: SPhoto) => (p.h > 0 ? p.w / p.h : 1);

/**
 * 写真の振り分け。順番 = ヒーロー大 → 背景(横長のみ)→ 各節の最初の 1 枚(客室・2 つめ・3 つめ)→ ヒーローの小 2 枚 → 各節を上限まで → 紹介記事。
 * 各節は、kinds に書いた種類の順に、上限の枚数まで取る(最初の 1 枚は、先頭の種類に 0 枚のときだけ 2 つめ以降の種類から)。写真は 1 度使ったら二度と使わない。
 */
function allocate(all: SPhoto[], secs: SecCopy[]): { hero: SPhoto[]; banner: SPhoto | null; bySlot: Record<"a" | "b" | "c", SPhoto[]>; article: SPhoto | null } {
  const used = new Set<string>();
  const free = (k: PKind) => all.filter((p) => !used.has(p.src) && p.kind === k);
  const use = (p: SPhoto | undefined | null): SPhoto | null => {
    if (!p) return null;
    used.add(p.src);
    return p;
  };
  /** 種類の順に見て、最初に見つかった 1 枚(横長優先 = 比率 1.2 以上があればそれ) */
  const pickOne = (order: PKind[], minRatio = 0, ok: (p: SPhoto) => boolean = () => true): SPhoto | null => {
    for (const k of order) {
      const c = free(k).filter((p) => ratio(p) >= minRatio && ok(p));
      if (c.length) return use(c[0]);
    }
    return null;
  };
  // 文字・看板・のぼりが主に写っている写真は、見出しを重ねるヒーロー大・「この宿で過ごす時間」の背景には使わない(使える写真が他に無いときのヒーロー大だけ許す)
  const plain = (p: SPhoto) => !/文字|のぼり|看板|ロゴ|横断幕/.test((p.what ?? "").split("。")[0]);

  const heroOrder: PKind[] = ["exterior", "view", "rooms", "living", "common", "bath", "dining", "other"];
  const smallOrder: PKind[] = ["view", "exterior", "common", "bath", "dining", "rooms", "living", "other"];
  // ヒーロー大: 外観・景色のうち、横長か正方形(縦長でない)ものを、写真の並びの先頭から → 縦長でも外観・景色 → ほかの種類の横長 → なんでも(料理や客室の写真は、外観・景色が無いときだけ)
  // 大きく出す写真は、幅が足りない(ぼやける)ものを避ける: ヒーロー大は 700px 以上・背景は 900px 以上(足りなければ背景の写真なし)
  const big = (p: SPhoto) => plain(p) && p.w >= 700;
  const h0 =
    pickOne(["exterior", "view"], 0.95, big) ?? pickOne(["exterior", "view"], 0, big) ?? pickOne(heroOrder, 1.2, big) ??
    pickOne(["exterior", "view"], 0.95, plain) ?? pickOne(["exterior", "view"], 0, plain) ?? pickOne(heroOrder, 1.2, plain) ??
    pickOne(["exterior", "view"], 0.95) ?? pickOne(["exterior", "view"]) ?? pickOne(heroOrder, 1.2) ?? pickOne(heroOrder);
  const banner = pickOne(["view", "exterior", "common", "other"], 1.3, (p) => plain(p) && p.w >= 900);

  const bySlot: Record<"a" | "b" | "c", SPhoto[]> = { a: [], b: [], c: [] };
  const CAP = { a: 4, b: 3, c: 3 } as const;
  // 各節の最初の 1 枚
  for (const s of secs) {
    const [main, ...alt] = s.kinds;
    const first = pickOne([main]) ?? pickOne(alt);
    if (first) bySlot[s.slot].push(first);
  }
  // ヒーローの小 2 枚
  const h1 = pickOne(smallOrder);
  const h2 = h1 ? pickOne(smallOrder) : null;
  // 各節を上限まで(kinds の先頭の種類から順に)
  for (const s of secs) {
    for (const k of s.kinds) {
      for (const p of free(k)) {
        if (bySlot[s.slot].length >= CAP[s.slot]) break;
        bySlot[s.slot].push(use(p)!);
      }
    }
  }
  const lastOrder: PKind[] = ["view", "exterior", "common", "other", "living", "rooms", "bath", "dining"];
  const article = pickOne(lastOrder, 0, plain) ?? pickOne(lastOrder);
  return { hero: [h0, h1, h2].filter((x): x is SPhoto => !!x), banner, bySlot, article };
}

// ---------------------------------------------------------------- 文
/** 文の並びを点検する(1 文ずつ。通らない文は落とす)。段落ごとの配列で返す */
export function checkedParagraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n+/)
    .map((x) => (x.trim().match(/[^。]+。?/g) ?? []).map((s) => s.trim()).filter((s) => s && stayLineOk(s)).join(""))
    .filter(Boolean);
}
const sentences = (paras: string[]): string[] => paras.flatMap((t) => t.match(/[^。]+。?/g) ?? []).map((s) => s.trim()).filter(Boolean);

/**
 * 宿の記事のページ(/stay/article/{id})に出せる本文があるか(導入か、見出しつきの節が、点検に通った文を 1 つでも持つ)。
 * 記事のページと同じ条件にそろえてあり、宿の紹介の「紹介記事」リンク・サイトマップの記事の行はこれで決める。
 */
export function hasArticleBody(place: Place): boolean {
  const a = place.article;
  if (!a) return false;
  if (checkedParagraphs(a.lede).length > 0) return true;
  return (a.sections ?? []).some((sec) => !!stayLine(sec.heading) && checkedParagraphs(sec.body).length > 0);
}

function httpHost(u: string): string {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** 記事の節(見出しの名前で選ぶ)の全文(点検済みの段落) */
function detailOf(place: Place, headings: string[]): string[] {
  const secs = place.article?.sections ?? [];
  const out: string[] = [];
  for (const h of headings) {
    const sec = secs.find((s) => s.heading === h);
    if (sec) out.push(...checkedParagraphs(sec.body));
  }
  return out;
}

// ---------------------------------------------------------------- 自動の短文(copy.ts に無い宿)
const RE_ONSEN = /温泉|露天|風呂|浴場|サウナ|湯/;
const RE_DINING = /食事|料理|夕食|朝食|ディナー|ランチ|ダイニング|レストラン|バーベキュー|BBQ|ご飯|グルメ|キッチン|自炊/i;
const RE_ROOMS = /客室|部屋|ルーム|ベッド|和室|洋室|寝室|スイート|コテージ|テント|ドーム|ヴィラ|キャビン|バンガロー|ドミトリー|サイト|宿泊棟|宿泊/;
const RE_ACCESS = /場所|アクセス|行き方|交通|周辺|所在地/;
function kindOfHeading(h: string): "bath" | "dining" | "rooms" | "access" | "other" {
  const cand: Array<["bath" | "dining" | "rooms" | "access", number]> = [
    ["access", h.search(RE_ACCESS)],
    ["bath", h.search(RE_ONSEN)],
    ["dining", h.search(RE_DINING)],
    ["rooms", h.search(RE_ROOMS)],
  ];
  const hit = cand.filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1])[0];
  return hit ? hit[0] : "other";
}
/** 文を 1 つずつ足して、総字数が max を超える手前で止める(最低 1 文) */
function clip(sents: string[], max: number): string[] {
  const out: string[] = [];
  let n = 0;
  for (const s of sents) {
    if (out.length > 0 && n + s.length > max) break;
    out.push(s);
    n += s.length;
  }
  return out;
}
/** 1 文を 2 行の見出しにする(1 行 14 字ほど。真ん中あたりの読点・助詞のあとで切る。30 字を超えるぶんは読点のところで切り捨てる) */
function twoLines(t: string): [string, string] {
  let s = t.replace(/[。.]+$/, "");
  if (s.length > 30) {
    const cut = s.slice(0, 30).lastIndexOf("、");
    s = cut > 8 ? s.slice(0, cut) : s.slice(0, 30);
  }
  if (s.length <= 15) return [s, ""];
  const mid = Math.floor(s.length / 2);
  let best = -1;
  for (let i = Math.max(6, mid - 5); i <= Math.min(s.length - 4, mid + 5); i++) {
    const ch = s[i - 1];
    if (ch === "、" || /[のにでとをはが]/.test(ch)) {
      if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid) || ch === "、") best = i;
    }
  }
  if (best < 0) best = mid;
  return [s.slice(0, best), s.slice(best)];
}

function autoCopy(shop: LiveShop, place: Place, attrs: StayAttributes): ShopCopy {
  const headline = shop.article?.headline ?? "";
  const lede = sentences(checkedParagraphs(place.article?.lede ?? place.intro));
  const groups: Record<"bath" | "dining" | "rooms", Array<{ heading: string; text: string[] }>> = { bath: [], dining: [], rooms: [] };
  for (const sec of place.article?.sections ?? []) {
    const heading = stayLine(sec.heading);
    const text = checkedParagraphs(sec.body);
    if (!heading || text.length === 0) continue;
    const k = kindOfHeading(heading);
    if (k === "bath" || k === "dining" || k === "rooms") groups[k].push({ heading, text });
  }
  const mk = (slot: "a" | "b" | "c", label: string, en: string, key: "rooms" | "bath" | "dining", kinds: PKind[]): SecCopy | null => {
    const g = groups[key][0];
    if (!g) return null;
    return { slot, label, en, h: twoLines(g.heading), p: clip(sentences(g.text), 90), from: groups[key].map((x) => x.heading), kinds };
  };
  const onsen = shop.tags.includes("温泉");
  const secs = [
    mk("a", "客室", "ROOMS", "rooms", ["rooms", "exterior"]),
    mk("b", onsen ? "温泉" : "お風呂", onsen ? "ONSEN" : "BATH", "bath", ["bath"]),
    mk("c", "お食事", "DINING", "dining", ["dining"]),
  ].filter((x): x is SecCopy => !!x);
  const boxes: FactBox[] = [];
  if (shop.checkIn) boxes.push({ icon: "calendar", l: "チェックイン", v: shop.checkIn });
  if (shop.checkOut) boxes.push({ icon: "calendar", l: "チェックアウト", v: shop.checkOut });
  if (shop.station) boxes.push({ icon: "train", l: "最寄り駅", v: shop.station });
  if (shop.area) boxes.push({ icon: "pin", l: "所在地", v: shop.area });
  if (shop.phone) boxes.push({ icon: "clock", l: "電話", v: shop.phone });
  const fac: ShopCopy["fac"] = [];
  if (shop.tags.some((t) => RE_ONSEN.test(t)) || attrs.onsen === true) fac.push({ k: "onsen", t: "温泉" });
  if (shop.tags.some((t) => /ペット/.test(t)) || attrs.petsAllowed === true) fac.push({ k: "paw", t: "ペット同伴" });
  const text = [place.article?.lede ?? "", ...(place.article?.sections ?? []).map((s) => s.body)].join("\n");
  const has = (re: RegExp) => sentences(checkedParagraphs(text)).some((s) => re.test(s) && !/なく|ない|不可|ません|できない|禁止|お断り/.test(s));
  if (has(/Wi-?Fi/i)) fac.push({ k: "wifi", t: "Wi-Fi" });
  if (has(/駐車場/)) fac.push({ k: "parking", t: "駐車場" });
  if (has(/バーベキュー|BBQ/i)) fac.push({ k: "bbq", t: "バーベキュー" });
  if (has(/キッチン/)) fac.push({ k: "kitchen", t: "キッチン" });
  const addr = shop.address || shop.area;
  return {
    tag: headline && visualLen(headline) <= 30 ? headline : "",
    big: shop.kindName,
    pills: shop.tags.slice(0, 2),
    boxes: boxes.slice(0, 3),
    intro: { h: twoLines(stayLine(headline).split("。")[0] || "この宿について"), p: clip(lede, 120) },
    secs,
    fac: fac.slice(0, 8),
    rows: [{ k: "種類" }, { k: "所在地" }, { k: "最寄り駅" }, { k: "電話番号" }, { k: "チェックイン" }, { k: "チェックアウト" }, { k: "公式サイト" }],
    access: [...(shop.station ? [{ icon: "train" as RowIcon, label: "最寄り駅", text: shop.station }] : []), ...(addr ? [{ icon: "pin" as RowIcon, label: "所在地", text: "@addr" }] : [])],
    accessFrom: (place.article?.sections ?? []).map((s) => s.heading).filter((h) => kindOfHeading(h) === "access"),
  };
}

// ---------------------------------------------------------------- 読み込み
export async function loadStayShopDetail(rawId: string): Promise<ShopDetail | null> {
  const id = safeDecode(rawId);
  const [shops, places] = await Promise.all([loadStayShops(), getPlaces("stay")]);
  const shop = shops.find((s) => s.id === id);
  const place = places.find((p) => p.id === id);
  if (!shop || !place) return null;
  return buildShopDetail(shop, place);
}

/** 1 軒ぶんの画面用データ(loadStayShopDetail が使う純関数。確認用の fixture の宿でも使える) */
export function buildShopDetail(shop: LiveShop, place: Place): ShopDetail {
  const L = syLinks("live");
  const attrs = ((place as { attributes?: StayAttributes }).attributes ?? {}) as StayAttributes;
  const cat = VERTICALS.stay.categories.find((c) => c.slug === shop.kind);
  const copy: ShopCopy = STAY_COPY[shop.id] ?? autoCopy(shop, place, attrs);

  // 写真: shop.photos(使える・人物が主役でないもの)に、元の説明(what)と種類(kind)を戻す
  const meta = new Map((place.photos ?? []).map((ph) => [ph.path, { what: (ph.what ?? "").trim(), kind: kindFromField((ph as { kind?: unknown }).kind) }]));
  const all: SPhoto[] = shop.photos.map((ph) => {
    const m = meta.get(ph.src);
    const what = stayLine(m?.what);
    return { ...ph, what, kind: refine(m?.kind ?? kindFromWhat(m?.what ?? ""), m?.what ?? "") };
  });

  // 節: 本文を点検に通し、通る文が無い節は出さない。写真の振り分けは出す節だけ
  const secsCopy = copy.secs
    .map((s) => ({ ...s, h: s.h.map((x) => (stayLineOk(x) ? x : "")).filter(Boolean) as [string, string], p: s.p.filter((x) => stayLineOk(x)) }))
    .filter((s) => s.p.length > 0);
  const alloc = allocate(all, secsCopy);

  const secs: Sec[] = secsCopy
    .map((s) => {
      const photos = alloc.bySlot[s.slot];
      const id = s.slot === "a" ? "sh-rooms" : s.slot === "b" ? "sh-bath" : "sh-dining";
      return { slot: s.slot, id, label: s.label, en: s.en, h: s.h, p: s.p, detail: detailOf(place, s.from), btn: `${s.label}の詳細を見る`, photos };
    })
    // 客室(a)は本文があれば出す。2 つめ・3 つめは写真があるときだけ(写真の無い節で形を崩さない)
    .filter((s) => s.slot === "a" || s.photos.length > 0);

  // 右上の箱
  const panel = { cap: shop.area, big: copy.big || shop.kindName, pills: (copy.pills ?? []).filter((x) => stayLineOk(x)), boxes: copy.boxes.filter((b) => stayLineOk(b.v)) };

  // 基本情報
  const addr = shop.address || shop.area;
  const rows: Row[] = [];
  for (const r of copy.rows) {
    const note = r.note && stayLineOk(r.note) ? r.note : undefined;
    if (r.k === "種類") {
      const v = r.v ?? shop.kindName;
      if (v) rows.push({ k: r.k, v });
    } else if (r.k === "所在地") {
      if (addr) rows.push({ k: r.k, v: addr });
    } else if (r.k === "最寄り駅") {
      if (shop.station) rows.push({ k: r.k, v: shop.station });
    } else if (r.k === "電話番号") {
      if (shop.phone) rows.push({ k: r.k, v: shop.phone, note, kind: "tel" });
    } else if (r.k === "チェックイン") {
      const v = r.v ?? shop.checkIn;
      if (v) rows.push({ k: r.k, v });
    } else if (r.k === "チェックアウト") {
      const v = r.v ?? shop.checkOut;
      if (v) rows.push({ k: r.k, v });
    } else if (r.k === "公式サイト") {
      if (shop.officialUrl) rows.push({ k: r.k, v: httpHost(shop.officialUrl), kind: "url", href: shop.officialUrl });
    } else if (r.v && stayLineOk(r.v)) {
      rows.push({ k: r.k, v: r.v });
    }
  }

  const access = copy.access
    .map((a) => ({ ...a, text: a.text === "@addr" ? addr : a.text }))
    .filter((a) => a.text && stayLineOk(a.text))
    .slice(0, 3);

  const headline = shop.article?.headline ?? "";
  const hasArticlePage = !!shop.photo && hasArticleBody(place);
  return {
    shop,
    place,
    path: `${VERTICALS.stay.path}/shop/${shop.id}`,
    schemaType: cat?.schemaType ?? "LodgingBusiness",
    hero: alloc.hero,
    banner: alloc.banner,
    tagline: stayLineOk(copy.tag) ? copy.tag : "",
    panel,
    intro: { h: copy.intro.h.filter((x) => x && stayLineOk(x)), p: copy.intro.p.filter((x) => stayLineOk(x)) },
    secs,
    // 事実のある設備が 1 つだけのときは、列にならないので出さない
    facilities: copy.fac.length >= 2 ? copy.fac.slice(0, 8) : [],
    rows,
    access,
    accessDetail: detailOf(place, copy.accessFrom),
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&hl=ja`,
    mapHref: shop.mapUrl ?? mapsSearchUrl(shop.name, addr),
    article: hasArticlePage ? { href: L.article(shop.id), title: headline || [shop.area, shop.kindName].filter(Boolean).join("の"), photo: alloc.article } : null,
  };
}
