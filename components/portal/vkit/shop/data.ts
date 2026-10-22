import "server-only";
import { getPlaces } from "@/lib/places";
import { findFeatureForPlace } from "@/lib/places/features";
import type { Place } from "@/lib/places/types";
import { mapsSearchUrl } from "@/lib/maps";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import { loadShops, vkLine, vkLineOk, visualLen, type LivePhoto, type LiveShop } from "../common/live";
import { vkLinks, type VkBoxKey, type VkConfig } from "../config";
import type { FacKey, RowIcon } from "./FacIcons";

/**
 * 店の紹介(本番 /{業種}/shop/{id})に出すものを、1 軒ぶん用意する(サーバー専用)。実在の店(getPlaces(業種))の実在のデータだけ。
 * 値が無い欄は空にして、画面側で出さない。文は出す前に 1 文ずつ点検する(common/live.ts の vkLineOk =
 * 料金・評価・「おすすめ」「人気」・〇選・最上級・効き目・体験した言い回しを含む文は落とす)。料金・星・口コミは持たない。
 *
 * ステイの店の紹介(stayproto/decided/shop/data.ts)を、業種に合わせて一般にしたもの。ステイは 客室・温泉・お食事 の 3 つの節を宿ごとの文(copy.ts)で出していたが、
 * ここでは紹介記事(Place.article)の節から、場所・時間・アクセスの節を除いた先頭の 3 つを、記事の見出しのまま節にする(文は記事の文をそのまま短く取る。言い換えない)。
 * 長い説明は、各節の「〇〇の詳細を見る」で開く(記事の節の全文。detail)。
 *
 * 写真(1 軒 10〜14 枚ほど)は、1 枚ずつの「種類」(外観・景色・中の様子・もの)で、ヒーロー・「ご案内」の背景・各節・紹介記事に振り分ける。
 *  - 種類は、写真の記録の kind(photos[].kind。あれば)か、写真の説明(what)の最初の 1 文の言葉で見分ける。
 *  - 節の写真は、写真の説明が節の見出し・本文の言葉に当たるものを先に取る。同じ写真を同じページで 2 回は使わない。足りないときは、節の写真の枚数を減らす(形は崩れない)。
 */

export type PKind = "exterior" | "view" | "inside" | "item" | "other";

export type SPhoto = LivePhoto & { what: string; kind: PKind };

export type Sec = {
  slot: "a" | "b" | "c";
  /** 追従タブの飛び先 id(vs-sec-a / vs-sec-b / vs-sec-c) */
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

export type FactBox = { icon: RowIcon; l: string; v: string };
export type Row = { k: string; v: string; note?: string; kind?: "tel" | "url"; href?: string };

export type ShopDetail = {
  shop: LiveShop;
  place: Place;
  path: string;
  schemaType: string;
  /** ヒーローの写真(最大 3 枚。1 枚目が大) */
  hero: SPhoto[];
  /** 「ご案内」の背景(横長の景色・外観。無ければ null) */
  banner: SPhoto | null;
  /** ヒーローの 1 行(短い事実の 1 文。無ければ空) */
  tagline: string;
  /** 右上の箱(種類・札・事実の欄) */
  panel: { cap: string; big: string; pills: string[]; boxes: FactBox[] };
  intro: { h: string[]; p: string[] };
  secs: Sec[];
  /** 設備・サービスのアイコン(事実のあるものだけ。最大 8) */
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
  /** 店の紹介記事のページ(写真のある店だけ。無ければ null)。photo は他の欄で使っていない写真(無ければ null) */
  article: { href: string; title: string; photo: SPhoto | null } | null;
};

// ---------------------------------------------------------------- 写真の種類
/** 写真の記録の kind(exterior/room/bath/meal/common/view の印。日本語でも)→ 種類。読めなければ null */
export function kindFromField(raw: unknown): PKind | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const r = raw.trim();
  if (/外観|exterior|facade|outside|building/i.test(r)) return "exterior";
  if (/景色|景観|眺|view|scenery|landscape|nature/i.test(r)) return "view";
  if (/客室|部屋|room|bath|風呂|温泉|共用|共有|館内|common|lobby|lounge|facility|interior|shared|内観|店内/i.test(r)) return "inside";
  if (/料理|食事|meal|dining|food|dish|商品|作品|item|product/i.test(r)) return "item";
  return null;
}

const W_EXTERIOR = /外観|玄関|正面|入口|入り口|建物|看板|鳥居|山門|門|本殿|拝殿|社殿|境内|ファサード/;
const W_INSIDE = /店内|館内|室内|内部|内観|スタジオ|ジム|道場|教室|フロア|ホール|工房|受付|ロビー|ラウンジ|レッスン室|トレーニング|マシン|更衣|シャワー|客席|カウンター/;
const W_ITEM = /作品|商品|器|花|用品|メニュー|料理|道具|器具|機材|ウェア|ボール|ラケット|クラブ|ミニチュア|展示|陳列|素材|生地|革|布|苗|野菜|写真アルバム|チラシ|パンフレット/;
const W_VIEW = /景色|眺|風景|空|海|山|川|湖|庭|庭園|森|滝|夕|夜景|桜|紅葉|芝|コース|フィールド|グリーン|敷地|ゲレンデ|ビーチ|川辺|畑|田/;
/** 写真の説明(what)の最初の 1 文の言葉 → 種類(kind が無い写真の見分け方。当たらなければ other) */
export function kindFromWhat(whatFull: string): PKind {
  const what = (whatFull ?? "").split("。")[0];
  if (!what) return "other";
  if (W_ITEM.test(what)) return "item";
  if (W_INSIDE.test(what)) return "inside";
  if (W_EXTERIOR.test(what)) return "exterior";
  if (W_VIEW.test(what)) return "view";
  return "other";
}

const ratio = (p: SPhoto) => (p.h > 0 ? p.w / p.h : 1);
/** 文字・看板・のぼりが主に写っている写真(見出しを重ねるヒーロー大・背景には使わない) */
const TEXTY = /文字|のぼり|看板|ロゴ|横断幕|バナー|ポスター|チラシ|パンフレット|地図|案内図|フロアマップ/;
export const plain = (p: { what?: string }) => !TEXTY.test((p.what ?? "").split("。")[0]);

/** 見出し・本文から、写真の説明(what)と照らし合わせる語を取る(英字 2 字以上・カタカナ 2 字以上・漢字 2 字以上) */
export function tokensOf(text: string): string[] {
  const out = new Set<string>();
  for (const re of [/[A-Za-z]{2,}/g, /[ァ-ヶー]{2,}/g, /[一-龠]{2,}/g]) {
    for (const m of text.match(re) ?? []) out.add(m.toLowerCase());
  }
  return [...out];
}

type SecCopy = { slot: "a" | "b" | "c"; heading: string; label: string; en: string; h: string[]; p: string[]; from: string[]; body: string };

/**
 * 写真の振り分け。順番 = ヒーロー大 → 背景(横長のみ)→ 各節の最初の 1 枚 → 各節を上限まで → ヒーローの小 2 枚(景色・外観 → 残り)→ 紹介記事。
 * 節の写真は、写真の説明が節の見出し・本文の言葉に当たる数が多い順(同じなら写真の並びの順)。写真は 1 度使ったら二度と使わない。
 */
function allocate(all: SPhoto[], secs: SecCopy[]): { hero: SPhoto[]; banner: SPhoto | null; bySlot: Record<"a" | "b" | "c", SPhoto[]>; article: SPhoto | null } {
  const used = new Set<string>();
  const free = () => all.filter((p) => !used.has(p.src));
  const use = (p: SPhoto | undefined | null): SPhoto | null => {
    if (!p) return null;
    used.add(p.src);
    return p;
  };
  /** 種類の順に見て、最初に見つかった 1 枚(横長優先 = 比率 minRatio 以上があればそれ) */
  const pickOne = (order: PKind[], minRatio = 0, ok: (p: SPhoto) => boolean = () => true): SPhoto | null => {
    for (const k of order) {
      const c = free().filter((p) => p.kind === k && ratio(p) >= minRatio && ok(p));
      if (c.length) return use(c[0]);
    }
    return null;
  };
  // 大きく出す写真は、幅が足りない(ぼやける)ものを避ける: ヒーロー大は 700px 以上・背景は 900px 以上
  const big = (p: SPhoto) => plain(p) && p.w >= 700;
  const heroOrder: PKind[] = ["exterior", "view", "inside", "item", "other"];
  const h0 =
    pickOne(["exterior", "view"], 0.95, big) ?? pickOne(["exterior", "view"], 0, big) ?? pickOne(heroOrder, 1.2, big) ??
    pickOne(["exterior", "view"], 0.95, plain) ?? pickOne(["exterior", "view"], 0, plain) ?? pickOne(heroOrder, 1.2, plain) ??
    pickOne(["exterior", "view"], 0.95) ?? pickOne(["exterior", "view"]) ?? pickOne(heroOrder, 1.2) ?? pickOne(heroOrder);
  const banner = pickOne(["view", "exterior", "inside", "other"], 1.3, (p) => plain(p) && p.w >= 900);

  const bySlot: Record<"a" | "b" | "c", SPhoto[]> = { a: [], b: [], c: [] };
  const CAP = { a: 4, b: 3, c: 3 } as const;
  const rel = (p: SPhoto, s: SecCopy) => {
    const w = (p.what ?? "").split("。")[0].toLowerCase();
    const ht = tokensOf(s.heading);
    const bt = tokensOf(s.body).filter((t) => !ht.includes(t));
    return 2 * ht.filter((t) => w.includes(t)).length + bt.filter((t) => w.includes(t)).length;
  };
  const order = (s: SecCopy) =>
    free()
      .map((p, i) => ({ p, i }))
      .sort((x, y) => rel(y.p, s) - rel(x.p, s) || x.i - y.i)
      .map((x) => x.p);
  // 各節の最初の 1 枚(説明が節の言葉に当たるものを先に。文字・看板が主役の写真は後回し)
  for (const s of secs) {
    const first = order(s).find((p) => plain(p)) ?? order(s)[0];
    if (first) bySlot[s.slot].push(use(first)!);
  }
  // 各節を上限まで(ヒーローの小が節の写真を持っていかないよう、節の写真を先に取る。節の写真は最大 3〜4 枚で、ヒーロー小の分を 2 枚残す)
  const keep = 2 + (secs.length > 0 ? 1 : 0);
  for (const s of secs) {
    for (const p of order(s)) {
      if (bySlot[s.slot].length >= CAP[s.slot]) break;
      if (free().length <= keep) break;
      if (rel(p, s) === 0 && bySlot[s.slot].length >= 2) break; // 当たる写真が無ければ、節は 2 枚まで
      bySlot[s.slot].push(use(p)!);
    }
  }
  // 節が 1 枚だけのときは、右が空いて見えるので、近い写真(景色・外観・中の様子)から 2 枚目を足す(2・3 つめの節だけ)
  for (const s of secs) {
    if (s.slot === "a" || bySlot[s.slot].length !== 1) continue;
    const extra = pickOne(["view", "exterior", "inside"], 0, plain);
    if (extra) bySlot[s.slot].push(extra);
  }
  // ヒーローの小 2 枚: 景色・外観から(文字・看板が主役の写真は除く)→ 残りの写真 → 3 枚以上ある節の最後の 1 枚
  const lend = (): SPhoto | null => {
    const donor = (["a", "c", "b"] as const).filter((k) => bySlot[k].length >= 3).sort((x, y) => bySlot[y].length - bySlot[x].length)[0];
    return donor ? (bySlot[donor].pop() ?? null) : null;
  };
  const rest: PKind[] = ["inside", "item", "other"];
  const h1 = pickOne(["view", "exterior"], 0, plain) ?? pickOne(rest, 0, plain) ?? lend();
  const h2 = h1 ? (pickOne(["view", "exterior"], 0, plain) ?? pickOne(rest, 0, plain) ?? lend()) : null;
  // 紹介記事の写真: 残りの写真から。残りが無いときは、3 枚以上ある節の最後の 1 枚
  const article = pickOne(["view", "exterior", "inside", "other", "item"], 0, plain) ?? pickOne(["view", "exterior", "inside", "other", "item"]) ?? lend();
  return { hero: [h0, h1, h2].filter((x): x is SPhoto => !!x), banner, bySlot, article };
}

// ---------------------------------------------------------------- 文
/** 文の並びを点検する(1 文ずつ。通らない文は落とす)。段落ごとの配列で返す */
export function checkedParagraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n+/)
    .map((x) => (x.trim().match(/[^。]+。?/g) ?? []).map((s) => s.trim()).filter((s) => s && vkLineOk(s)).join(""))
    .filter(Boolean);
}
const sentences = (paras: string[]): string[] => paras.flatMap((t) => t.match(/[^。]+。?/g) ?? []).map((s) => s.trim()).filter(Boolean);

/**
 * 記事のページ(/{業種}/article/{id})に出せる本文があるか(導入か、見出しつきの節が、点検に通った文を 1 つでも持つ)。
 * 記事のページと同じ条件にそろえてあり、店の紹介の「紹介記事」リンク・サイトマップの記事の行はこれで決める。
 */
export function hasArticleBody(place: Place): boolean {
  const a = place.article;
  if (!a) return false;
  if (checkedParagraphs(a.lede).length > 0) return true;
  return (a.sections ?? []).some((sec) => !!vkLine(sec.heading) && checkedParagraphs(sec.body).length > 0);
}

function httpHost(u: string): string {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
export function twoLines(t: string): [string, string] {
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

/** 節の見出し → タブ・節の短い名前(8 字まで。「由緒と社殿」→「由緒」、「馬にゆかりの境内」→「境内」) */
export function shortLabel(h: string): string {
  let t = h.trim();
  if (t.includes("と")) t = t.split("と")[0];
  else if (t.length > 8 && t.includes("の")) t = t.slice(t.lastIndexOf("の") + 1);
  t = t.replace(/[「」『』]/g, "");
  return t.length > 8 ? t.slice(0, 8) : t || h.slice(0, 8);
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

const NEG = /なく|ない|不可|ません|できない|禁止|お断り|ご遠慮|ありません/;

// ---------------------------------------------------------------- 読み込み
export async function loadShopDetail(cfg: VkConfig, rawId: string): Promise<ShopDetail | null> {
  const id = safeDecode(rawId);
  const [shops, places] = await Promise.all([loadShops(cfg), getPlaces(cfg.key)]);
  const shop = shops.find((s) => s.id === id);
  const place = places.find((p) => p.id === id);
  if (!shop || !place) return null;
  // 店の特集記事(features-{業種}.json)があれば、その本文は店の記事のページに出る(articleData.ts)。紹介記事のリンクはそこへ
  const hasFeature = !!(await findFeatureForPlace(cfg.key, place.id));
  return buildShopDetail(cfg, shop, place, hasFeature);
}

const BOX: Record<VkBoxKey, { icon: RowIcon; l: string }> = {
  station: { icon: "train", l: "最寄り駅" },
  area: { icon: "pin", l: "所在地" },
  hours: { icon: "clock", l: "営業時間" },
  holidays: { icon: "calendar", l: "定休日" },
  phone: { icon: "phone", l: "電話" },
};

/** 1 軒ぶんの画面用データ(loadShopDetail が使う純関数) */
export function buildShopDetail(cfg: VkConfig, shop: LiveShop, place: Place, hasFeature = false): ShopDetail {
  const L = vkLinks(cfg);
  const cat = VERTICALS[cfg.key].categories.find((c) => c.slug === shop.kind);
  const art = place.article;

  // 写真: shop.photos(使える・人物が主役でないもの)に、元の説明(what)と種類(kind)を戻す
  const meta = new Map((place.photos ?? []).map((ph) => [ph.path, { what: (ph.what ?? "").trim(), kind: kindFromField((ph as { kind?: unknown }).kind) }]));
  const all: SPhoto[] = shop.photos.map((ph) => {
    const m = meta.get(ph.src);
    const what = vkLine(m?.what);
    return { ...ph, what, kind: m?.kind ?? kindFromWhat(m?.what ?? "") };
  });

  // 節: 記事の節のうち、場所・時間・アクセスの節(placeHeading)を除いた先頭の 3 つ。本文を点検に通し、通る文が無い節は出さない
  const placeRe = new RegExp(cfg.placeHeading);
  const arts = (art?.sections ?? []).map((s) => ({ heading: vkLine(s.heading), text: checkedParagraphs(s.body) })).filter((s) => s.heading && s.text.length > 0);
  const slots = ["a", "b", "c"] as const;
  const secsCopy: SecCopy[] = arts
    .filter((s) => !placeRe.test(s.heading))
    .slice(0, 3)
    .map((s, i) => ({
      slot: slots[i],
      heading: s.heading,
      label: shortLabel(s.heading),
      en: `GUIDE 0${i + 1}`,
      h: twoLines(s.heading).filter(Boolean),
      p: clip(sentences(s.text), 90),
      from: [s.heading],
      body: s.text.join(""),
    }));
  const alloc = allocate(all, secsCopy);

  const secs: Sec[] = secsCopy
    .map((s) => ({
      slot: s.slot,
      id: `vs-sec-${s.slot}`,
      label: s.label,
      en: s.en,
      // 節の名前(label)が見出しそのままのときは、同じ字を 2 回出さない
      h: s.label === s.heading ? [] : s.h,
      p: s.p,
      detail: detailOf(place, s.from),
      btn: `${s.label}の詳細を見る`,
      photos: alloc.bySlot[s.slot],
    }))
    // 1 つめの節は本文があれば出す。2 つめ・3 つめは写真があるときだけ(写真の無い節で形を崩さない)
    .filter((s) => s.slot === "a" || s.photos.length > 0);

  // 右上の箱(設定の boxes の順に、値のあるものを 3 つまで)
  const boxVal: Record<VkBoxKey, string> = {
    station: shop.station,
    area: shop.area,
    hours: shop.hours.length <= 28 ? shop.hours : "",
    holidays: shop.holidays,
    phone: shop.phone,
  };
  const boxes: FactBox[] = cfg.boxes
    .filter((k) => boxVal[k] && vkLineOk(boxVal[k]))
    .slice(0, 3)
    .map((k) => ({ icon: BOX[k].icon, l: BOX[k].l, v: boxVal[k] }));
  const panel = { cap: shop.area, big: shop.kindName, pills: shop.tags.slice(0, 2), boxes };

  // 基本情報
  const addr = shop.address || shop.area;
  const rows: Row[] = [];
  if (shop.kindName) rows.push({ k: "種類", v: shop.kindName });
  if (addr) rows.push({ k: "所在地", v: addr });
  if (shop.station) rows.push({ k: "最寄り駅", v: shop.station });
  if (shop.hours && vkLineOk(shop.hours)) rows.push({ k: "営業時間", v: shop.hours });
  if (shop.holidays && vkLineOk(shop.holidays)) rows.push({ k: "定休日", v: shop.holidays });
  if (shop.phone) rows.push({ k: "電話番号", v: shop.phone, kind: "tel" });
  if (shop.officialUrl) rows.push({ k: "公式サイト", v: httpHost(shop.officialUrl), kind: "url", href: shop.officialUrl });

  const access: ShopDetail["access"] = [
    ...(shop.station ? [{ icon: "train" as RowIcon, label: "最寄り駅", text: shop.station }] : []),
    ...(addr ? [{ icon: "pin" as RowIcon, label: "所在地", text: addr }] : []),
  ].filter((a) => vkLineOk(a.text)).slice(0, 3);
  const accessFrom = (art?.sections ?? []).map((s) => s.heading).filter((h) => placeRe.test(h));

  // 設備・サービス: 記事の文に当たる語があり、打ち消しの文でないものだけ(2 つ以上のときだけ出す)
  const text = [art?.lede ?? "", ...(art?.sections ?? []).map((s) => s.body)].join("\n");
  const sents = sentences(checkedParagraphs(text));
  const facilities: ShopDetail["facilities"] = [];
  for (const r of cfg.facilities) {
    const re = new RegExp(r.re, "i");
    if (sents.some((s) => re.test(s) && !NEG.test(s)) && !facilities.some((f) => f.k === r.k)) facilities.push({ k: r.k as FacKey, t: r.t });
  }

  // ヒーローの 1 行: 見出し(headline)の最初の 1 文(34 字まで)。無ければ空
  const head = shop.article?.headline ?? "";
  const first = head.split("。")[0].trim();
  const tagline = first && visualLen(first) <= 34 ? first : "";

  // ご案内(導入): 記事の導入の最初の 2 文ほど(120 字まで)。見出しはヒーローの 1 行と同じ文を繰り返さない
  const lede = clip(sentences(checkedParagraphs(art?.lede ?? place.intro)), 120);
  const intro = { h: [...cfg.introH], p: lede };

  const hasArticlePage = !!shop.photo && (hasArticleBody(place) || hasFeature);
  return {
    shop,
    place,
    path: `${VERTICALS[cfg.key].path}/shop/${shop.id}`,
    schemaType: cat?.schemaType ?? "LocalBusiness",
    hero: alloc.hero,
    banner: alloc.banner,
    tagline: vkLineOk(tagline) ? tagline : "",
    panel,
    intro,
    secs,
    facilities: facilities.length >= 2 ? facilities.slice(0, 8) : [],
    rows,
    access,
    accessDetail: detailOf(place, accessFrom),
    mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(addr || shop.name)}&output=embed&hl=ja`,
    mapHref: shop.mapUrl ?? mapsSearchUrl(shop.name, addr),
    article: hasArticlePage ? { href: L.article(shop.id), title: head || [shop.area, shop.kindName].filter(Boolean).join("の"), photo: alloc.article } : null,
  };
}
