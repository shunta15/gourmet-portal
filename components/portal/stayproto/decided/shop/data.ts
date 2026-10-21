import "server-only";
import { getPlaces } from "@/lib/places";
import type { Place, StayAttributes } from "@/lib/places/types";
import { mapsSearchUrl } from "@/lib/maps";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import { loadStayShops, stayLine, stayLineOk, visualLen, type LivePhoto, type LiveShop } from "../common/live";
import { syLinks } from "../common/site";

/**
 * 宿の紹介(本番 /stay/shop/{id})に出すものを、1 軒ぶん用意する(サーバー専用)。実在の宿(getPlaces('stay'))の実在のデータだけ。
 * 値が無い欄は空にして、画面側で出さない。文は出す前に 1 文ずつ点検する(common/live.ts の stayLineOk =
 * 料金・評価・「おすすめ」「人気」・〇選・最上級・効き目や癒し・泊まった体験の言い回しを含む文は落とす)。料金・星・口コミは持たない。
 *
 * 紹介記事(Place.article)の節は、見出しの言葉で 客室 / 温泉 / お食事 / アクセス に振り分ける(どれにも当たらない節は、この画面には出さない。
 * 記事のページ /stay/article/{id} にある)。写真は、写真の説明(what)の言葉で 客室 / 温泉 / お食事 に振り分け、当たらない写真は
 * ヒーロー・「この宿について」の背景に回す。説明の無い写真は、振り分けずヒーロー・背景にだけ使う(別の欄に誤って載せない)。
 */

export type SPhoto = LivePhoto & { what: string };
export type Block = { heading: string; text: string[] };
export type Group = { blocks: Block[]; photos: SPhoto[] };

export type ShopDetail = {
  shop: LiveShop;
  place: Place;
  path: string;
  schemaType: string;
  /** ヒーローの写真(最大 3 枚。1 枚目が大) */
  hero: SPhoto[];
  /** 「この宿について」の背景(無ければ null) */
  banner: SPhoto | null;
  /** 「この宿について」の本文(段落。点検済み。無ければ空) */
  intro: string[];
  /** ヒーローの 1 行(宿の紹介の 1 行。短いときだけ。無ければ空) */
  tagline: string;
  rooms: Group;
  onsen: Group;
  dining: Group;
  /** 客室タイプの名前(あれば) */
  roomTypes: string[];
  /** 施設・サービスの札(タグ・温泉・ペット同伴。最大 8) */
  facilities: string[];
  /** 基本情報の表(値があるものだけ) */
  rows: Array<{ k: string; v: string; kind?: "tel" | "url"; href?: string }>;
  /** アクセスの行(駅・車などの事実の文。最大 4) */
  access: Array<{ icon: "train" | "car" | "pin"; label: string; text: string }>;
  mapHref: string;
  /** 宿の紹介記事のページ(写真のある宿だけ。無ければ null) */
  article: { href: string; title: string; photo: SPhoto } | null;
  /** 記事のページがあるとき、節の本文は最初の 2 文までにして続きは記事へ(true)/ 全文をここに出す(false) */
  excerpt: boolean;
};

// ---- 振り分け ----
const RE_ONSEN = /温泉|露天|風呂|浴場|サウナ|湯/;
const RE_DINING = /食事|料理|夕食|朝食|ディナー|ランチ|ダイニング|レストラン|バーベキュー|BBQ|ご飯|グルメ/i;
const RE_ROOMS = /客室|部屋|ルーム|ベッド|和室|洋室|寝室|スイート|コテージ|テント|ドーム|ヴィラ|キャビン|バンガロー|ドミトリー|キャンプサイト|フリーサイト|区画サイト|オートサイト|サイト|宿泊/;
const RE_ACCESS = /場所|アクセス|行き方|交通|周辺|所在地/;

/** 見出しの振り分け。複数の語が入る見出し(「客室とお風呂」)は、いちばん先に出る語の欄にする */
function kindOfHeading(h: string): "onsen" | "dining" | "rooms" | "access" | "other" {
  const cand: Array<["onsen" | "dining" | "rooms" | "access", number]> = [
    ["access", h.search(RE_ACCESS)],
    ["onsen", h.search(RE_ONSEN)],
    ["dining", h.search(RE_DINING)],
    ["rooms", h.search(RE_ROOMS)],
  ];
  const hit = cand.filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1])[0];
  return hit ? hit[0] : "other";
}
/** 写真の説明(what)の言葉 → 欄。説明の無い写真・どれにも当たらない写真は "other"(ヒーロー・「この宿について」の背景に回す) */
const PH_ONSEN = /温泉|露天|風呂|浴場|浴室|浴槽|湯船|サウナ/;
const PH_DINING = /食事|料理|夕食|朝食|ディナー|ランチ|レストラン|バーベキュー|BBQ|ごはん|ご飯|サラダ|膳|串焼き|ビュッフェ/;
const PH_ROOMS = /客室|部屋|ルーム|ベッド|寝具|布団|寝室|ロフト|ツイン|和室|洋室|座卓|畳敷き|スイート|ドミトリー|テント|ドーム|キャビン|バンガロー|コテージ(の|内)|キャンプサイト|フリーサイト|区画サイト|オートサイト/;
function kindOfPhoto(whatFull: string): "onsen" | "dining" | "rooms" | "other" {
  // 説明の最初の 1 文(写っているものの主題)の言葉で見る。2 文め以降の補足(「…客室の建物が点在している」など)には引きずられない
  const what = whatFull.split("。")[0];
  if (!what) return "other";
  if (PH_ONSEN.test(what)) return "onsen";
  if (PH_DINING.test(what)) return "dining";
  if (PH_ROOMS.test(what)) return "rooms";
  return "other";
}

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

  // 写真: shop.photos(使える・人物が主役でないもの)に、元の説明(what)を戻す
  const whatOf = new Map((place.photos ?? []).map((ph) => [ph.path, (ph.what ?? "").trim()]));
  const all: SPhoto[] = shop.photos.map((ph) => ({ ...ph, what: stayLine(whatOf.get(ph.src)) }));
  const hero = all.slice(0, 3);
  const rest = all.slice(3);
  const used = new Set<string>();
  const take = (kind: "onsen" | "dining" | "rooms", max: number): SPhoto[] => {
    const out = rest.filter((ph) => !used.has(ph.src) && kindOfPhoto(ph.what) === kind).slice(0, max);
    out.forEach((ph) => used.add(ph.src));
    return out;
  };
  const roomPh = take("rooms", 8);
  const onsenPh = take("onsen", 3);
  const diningPh = take("dining", 3);
  const banner = rest.find((ph) => !used.has(ph.src) && kindOfPhoto(ph.what) === "other") ?? null;

  // 節の振り分け
  const groups: Record<"onsen" | "dining" | "rooms" | "access", Block[]> = { onsen: [], dining: [], rooms: [], access: [] };
  for (const sec of place.article?.sections ?? []) {
    const heading = stayLine(sec.heading);
    const text = checkedParagraphs(sec.body);
    if (!heading || text.length === 0) continue;
    const k = kindOfHeading(heading);
    if (k !== "other") groups[k].push({ heading, text });
  }

  // 「この宿について」の本文: 導入の文(点検済み。5 文まで)
  const introAll = checkedParagraphs(place.article?.lede ?? place.intro);
  const introSents = sentences(introAll).slice(0, 5);
  const intro = introSents.length ? [introSents.join("")] : [];

  const headline = shop.article?.headline ?? "";
  const tagline = headline && visualLen(headline) <= 46 ? headline : "";

  // 客室タイプ(名前だけ)
  const roomTypes = (attrs.roomTypes ?? []).map((x) => stayLine(x)).filter(Boolean).slice(0, 10);

  // 施設・サービスの札
  const fac: string[] = [...shop.tags];
  if (attrs.onsen === true && !fac.some((t) => RE_ONSEN.test(t))) fac.push("温泉");
  if (attrs.petsAllowed === true && !fac.some((t) => /ペット/.test(t))) fac.push("ペット同伴");
  const facilities = [...new Set(fac)].slice(0, 8);

  // 基本情報
  const rows: ShopDetail["rows"] = [];
  const add = (k: string, v: string | undefined, extra?: Partial<ShopDetail["rows"][number]>) => {
    const t = (v ?? "").trim();
    if (t) rows.push({ k, v: t, ...extra });
  };
  add("種類", shop.kindName);
  add("所在地", shop.address || shop.area);
  add("最寄り駅", shop.station);
  add("電話番号", shop.phone, { kind: "tel" });
  add("チェックイン", shop.checkIn);
  add("チェックアウト", shop.checkOut);
  add("客室タイプ", roomTypes.join("・"));
  if (shop.officialUrl) add("公式サイト", httpHost(shop.officialUrl), { kind: "url", href: shop.officialUrl });

  // アクセス(事実の文: 駅・IC・バス・空港・徒歩・車での行き方の語を含む文。ゲートの閉門・定休・予約の文は除く)
  const accessSents = sentences(groups.access.flatMap((b) => b.text)).filter((s) => /駅|IC|インター|バス|空港|港|徒歩|車で|キロ|km/.test(s) && !/ゲート|閉門|クワイエット|定休|予約|電話/.test(s));
  const access: ShopDetail["access"] = [];
  if (shop.station) access.push({ icon: "train", label: "最寄り駅", text: shop.station });
  for (const s of accessSents.slice(0, 3)) {
    const pub = /駅|電車|バス|徒歩/.test(s);
    access.push({ icon: pub ? "train" : "car", label: pub ? "電車・バスでお越しの方" : "お車でお越しの方", text: s });
  }
  const addr = shop.address || shop.area;
  if (addr) access.push({ icon: "pin", label: "所在地", text: addr });

  const hasArticlePage = !!shop.photo && hasArticleBody(place);
  return {
    shop,
    place,
    path: `${VERTICALS.stay.path}/shop/${shop.id}`,
    schemaType: cat?.schemaType ?? "LodgingBusiness",
    hero,
    banner,
    intro,
    tagline,
    rooms: { blocks: groups.rooms, photos: roomPh },
    onsen: { blocks: groups.onsen, photos: onsenPh },
    dining: { blocks: groups.dining, photos: diningPh },
    roomTypes,
    facilities,
    rows,
    access: access.slice(0, 5),
    mapHref: shop.mapUrl ?? mapsSearchUrl(shop.name, shop.address || shop.area),
    article: hasArticlePage ? { href: L.article(shop.id), title: headline || [shop.area, shop.kindName].filter(Boolean).join("の"), photo: all[1] ?? all[0] } : null,
    excerpt: hasArticlePage,
  };
}
