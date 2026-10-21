import { getPlaces } from "@/lib/places";
import type { Place } from "@/lib/places/types";
import { interleave, loadStayArticles, stayLineOk, stayLine, toShop, type LiveArticle, type LivePhoto, type LiveShop } from "../../common/live";

/**
 * 宿の記事ページ(/stay/article/{id})の中身を、実在の宿の Place から作る(サーバー専用)。
 * 記事の文は Place.article(headline・lede・sections・sources)だけ。足さない・言い換えない(文の点検で落とすだけ)。
 * 泊まった体験・モデルプラン・おすすめ・料金・評価は出さない。点検に通らない文は、その 1 文だけ落とす(stayLineOk)。
 */

export type ArtSection = { no: string; id: string; heading: string; paras: string[]; photo: LivePhoto | null };

export type ArticleView = {
  shop: LiveShop;
  /** 事実だけの 1 行(点検済み。通らなければ「静岡県富士市の旅館」のような所在地+種類) */
  headline: string;
  lede: string[];
  sections: ArtSection[];
  hero: LivePhoto | null;
  /** 1 つ目の「掲載している宿」の説明(導入の最初の 1 文) */
  blurb: string;
  info: Array<{ k: string; v: string }>;
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

/** 点検に通る文だけを残して、読みやすい段落(最大 3 文・おおむね 120 字)に分ける */
export function paragraphs(text: string | undefined): string[] {
  const ok = sentences(text ?? "").filter((s) => stayLineOk(s));
  const out: string[] = [];
  let cur = "";
  let n = 0;
  for (const s of ok) {
    if (cur && (n >= 3 || cur.length + s.length > 130)) {
      out.push(cur);
      cur = "";
      n = 0;
    }
    cur += s;
    n++;
  }
  if (cur) out.push(cur);
  return out;
}

const KW_BATH = /風呂|温泉|湯|サウナ|浴/;
const KW_FOOD = /食|料理|メニュー|朝|夕|ご飯|カフェ|レストラン|喫茶|バーベキュー|BBQ/;
const KW_ROOM = /客室|部屋|室|ベッド|寝|コテージ|ロッジ|テント|サイト|棟|ログ|離れ/;
const KW_OUT = /外観|全景|外|庭|景色|眺め|入口|エントランス|周辺/;

function whatOf(p: LivePhoto): string {
  const i = p.alt.indexOf(" — ");
  return i >= 0 ? p.alt.slice(i + 3) : "";
}

/** 見出し・本文の語に合う写真を選ぶ。合うものが無ければ、まだ使っていない写真を順に */
function pickPhoto(photos: LivePhoto[], used: Set<string>, text: string): LivePhoto | null {
  const free = photos.filter((p) => !used.has(p.src + p.alt));
  if (free.length === 0) return null;
  const kw = KW_BATH.test(text) ? KW_BATH : KW_FOOD.test(text) ? KW_FOOD : KW_ROOM.test(text) ? KW_ROOM : null;
  const hit = kw ? free.find((p) => kw.test(whatOf(p))) : undefined;
  const p = hit ?? free[0];
  used.add(p.src + p.alt);
  return p;
}

/** 宿の ID から記事の表示用データを作る。宿が無い・紹介記事が無い・使える文が 1 つも無ければ null(404)。places を渡すと、その宿の集まりで作る(確認用) */
export async function loadStayArticle(id: string, given?: Place[]): Promise<ArticleView | null> {
  const places = given ?? (await getPlaces("stay"));
  const place = places.find((p) => p.id === id);
  if (!place?.article) return null;
  const shop = toShop(place);
  const a = place.article;

  const lede = paragraphs(a.lede);
  const used = new Set<string>();
  const photos = shop.photos;
  // 先頭の写真ではなく、外観・景色らしい写真があればそれをヒーローに
  const heroPick = photos.find((p) => KW_OUT.test(whatOf(p))) ?? photos[0] ?? null;
  if (heroPick) used.add(heroPick.src + heroPick.alt);

  const sections: ArtSection[] = [];
  for (const s of a.sections ?? []) {
    const paras = paragraphs(s.body);
    const heading = (s.heading ?? "").trim();
    if (paras.length === 0 || !heading || !stayLineOk(heading)) continue;
    const n = sections.length + 1;
    sections.push({ no: String(n).padStart(2, "0"), id: `sy-a-s${n}`, heading, paras, photo: pickPhoto(photos, used, heading + paras[0]) });
  }
  if (lede.length === 0 && sections.length === 0) return null;

  const headline = stayLine(a.headline) || [shop.area, shop.kindName].filter(Boolean).join("の");
  const info: Array<{ k: string; v: string }> = [];
  if (shop.address) info.push({ k: "所在地", v: shop.address });
  if (shop.station) info.push({ k: "アクセス", v: shop.station });
  if (shop.checkIn) info.push({ k: "チェックイン", v: shop.checkIn });
  if (shop.checkOut) info.push({ k: "チェックアウト", v: shop.checkOut });
  if (shop.phone) info.push({ k: "電話", v: shop.phone });

  // あわせて読みたい: 同じ都道府県 → 同じ種類 → ほか(写真と記事のある宿。種類を順に回した並び)
  const shops = places.map(toShop);
  const others = (await loadStayArticles(shops)).filter((x) => x.id !== id);
  const same = (x: LiveArticle) => (x.shop.pref === shop.pref ? 0 : x.shop.kind === shop.kind ? 1 : 2);
  const related = interleave(others.map((x) => x.shop))
    .map((s) => others.find((x) => x.id === s.id)!)
    .sort((x, y) => same(x) - same(y))
    .slice(0, 3);

  return {
    shop,
    headline,
    lede,
    sections,
    hero: heroPick,
    blurb: lede[0]?.split("。")[0] ? `${lede[0].split("。")[0]}。` : "",
    info,
    sources: (a.sources ?? []).filter((s) => /^https?:\/\//.test(s.url) && s.label),
    checkedAt: a.checkedAt,
    related,
  };
}
