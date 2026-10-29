import "server-only";
/**
 * 総合トップの「新着情報」(2026-10-29 オーナー指示「〇〇店が紹介されました/特集記事が追加された系にして、制作側の目線の情報は全部削除」)。
 * 中身は手書きにせず、サイトの実データから作る。種類は 2 つだけ:
 *   - 店: 「<店名>が紹介されました」 → その店のページ(グルメ /restaurant/<ID>・ほか /<業種>/shop/<ID>)
 *   - 特集記事: 「特集記事『<題>』が追加されました」 → その記事(グルメ /feature/<ID>・ほか /<業種>/special/<slug>)
 * 何を載せるか = 各業種の一覧ページに今出ているものだけ(店は getAllRestaurants / getPlaces。限定公開・保留・非表示は、それらの入口がすでに外している。
 *   特集は、グルメは /feature の一覧と同じ FEATURES、ほかの業種は /<業種>/special の一覧と同じ lib/specials/<業種>.json(ボディケアだけ lib/portal/vert/bodygreen/special.ts)。アクティビティは特集の一覧が無い)。
 * 日付 = lib/portal/newsDates.generated.json(automation/news-dates/build-news-dates.mjs が git の main の履歴から作る
 *   =「見える状態で main に入った日」)。ID の完全一致で突き合わせ、台帳に無いもの(日付が確かめられないもの)は載せない。推測で日付を作らない。
 *   特集の JSON にある date は「記事の日付」で、サイトに載った日とずれることがある(ペット特集 boarding: date は 10-24、main に入ったのは 10-28)ので、載った日(台帳)を使う。
 */
import { getAllRestaurants } from "@/lib/db/restaurants";
import { getPlaces } from "@/lib/places";
import { FEATURES } from "@/lib/data";
import { VERTICAL_ORDER } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { SPECIALS as BODYCARE_SPECIALS } from "@/lib/portal/vert/bodygreen/special";
import beautySpecials from "@/lib/specials/beauty.json";
import petSpecials from "@/lib/specials/pet.json";
import staySpecials from "@/lib/specials/stay.json";
import sportsSpecials from "@/lib/specials/sports.json";
import lifeSpecials from "@/lib/specials/life.json";
import dates from "./newsDates.generated.json";

export type NewsItem = {
  /** YYYY.MM.DD(日本時間) */
  date: string;
  vertical: VerticalKey;
  /** 札の文字(業種名) */
  tag: string;
  kind: "shop" | "feature";
  /** 店名・記事の題(データのまま) */
  name: string;
  href: string;
};

const TAG: Record<VerticalKey, string> = {
  gourmet: "グルメ",
  beauty: "ビューティー",
  bodycare: "ボディケア",
  pet: "ペット",
  stay: "ステイ",
  activity: "アクティビティ",
  sports: "スポーツ",
  life: "くらし",
};

type Cand = NewsItem & { ts: string; order: number };

const ledger = dates as unknown as {
  stores: Record<string, Record<string, string>>;
  features: { gourmet: Record<string, string> };
  specials: Record<string, Record<string, string>>;
};

const jstDate = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
};

type SpecialLike = { slug: string; title: string };
const SPECIAL_ITEMS: Partial<Record<VerticalKey, SpecialLike[]>> = {
  beauty: (beautySpecials as { items: SpecialLike[] }).items,
  bodycare: BODYCARE_SPECIALS,
  pet: (petSpecials as { items: SpecialLike[] }).items,
  stay: (staySpecials as { items: SpecialLike[] }).items,
  sports: (sportsSpecials as { items: SpecialLike[] }).items,
  life: (lifeSpecials as { items: SpecialLike[] }).items,
};

export async function getNewsItems(limit = 4): Promise<NewsItem[]> {
  const cands: Cand[] = [];
  const push = (vertical: VerticalKey, kind: NewsItem["kind"], name: string, href: string, iso: string | undefined, order: number) => {
    if (!iso || !name) return; // 日付が確かめられないものは載せない
    cands.push({ ts: iso, date: jstDate(iso), vertical, tag: TAG[vertical], kind, name, href, order });
  };

  // 店
  const rest = await getAllRestaurants();
  rest.forEach((r, i) => push("gourmet", "shop", r.name, `/restaurant/${r.id}`, ledger.stores.gourmet?.[r.id], i));
  for (const v of VERTICAL_ORDER) {
    if (v === "gourmet") continue;
    const places = await getPlaces(v);
    places.forEach((p, i) => push(v, "shop", p.name, `/${v}/shop/${p.id}`, ledger.stores[v]?.[p.id], i));
  }
  // 特集記事
  FEATURES.forEach((f, i) => push("gourmet", "feature", f.title, `/feature/${f.id}`, ledger.features.gourmet?.[f.id], i));
  for (const v of VERTICAL_ORDER) {
    (SPECIAL_ITEMS[v] ?? []).forEach((s, i) => push(v, "feature", s.title, `/${v}/special/${s.slug}`, ledger.specials[v]?.[s.slug], i));
  }

  // 新しい順。同じ時刻(同じ取り込み)の中は、業種の並び(VERTICAL_ORDER)→データの並び
  const vo = (v: VerticalKey) => VERTICAL_ORDER.indexOf(v);
  cands.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : vo(a.vertical) - vo(b.vertical) || a.order - b.order));
  return cands.slice(0, limit).map(({ ts: _t, order: _o, ...x }) => x);
}
