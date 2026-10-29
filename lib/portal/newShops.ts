import "server-only";
/**
 * 総合トップの「新しく載ったお店」(2026-10-29 オーナー決定「最近マチノワに載った実在のお店 3 つを、写真カードで並べる。押すとそのお店のページに飛ぶ。中身は自動で入れ替わる」)。
 * 何を選ぶか:
 *   - 店だけ。「サイトに載った日」の台帳(lib/portal/newsDates.generated.json。新着情報 lib/portal/news.ts と同じ)の新しい順。同じ時刻の中は 業種の並び → データの並び(news.ts と同じ)。
 *   - 各業種の一覧に実際に出ている店だけ(getAllRestaurants / getPlaces がすでに限定公開・保留・非表示を外している)。台帳に無い店(日付が確かめられない)は出さない。
 *   - 店の実際の写真があるものだけ。写真 = その店のページの 1 枚め(グルメ = heroImagesOf の先頭 / ほか = Place.photos の先頭 → images → image。components/portal/pages/shop.tsx の photosOf と同じ)。
 *     使ってよい写真か(photoRules の isUsableImage)に加えて、店の写真の置き場(/restaurants/ と /_portal/vshops/)のものだけ。AI 画像・業種の飾り画像・プレースホルダは飛ばして次の店へ。
 *   - 町名 = グルメは area(町名)、ほかは cityName(市区町村名)。データに無ければ出さない。
 */
import { getAllRestaurants } from "@/lib/db/restaurants";
import { getPlaces } from "@/lib/places";
import { VERTICAL_ORDER } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { heroImagesOf } from "@/lib/portal/noren/shop";
import { isUsableImage } from "@/lib/portal/photoRules";
import { shopPhoto, type PhotoAttrs } from "@/lib/portal/photos";
import { TAG, ledger, jstDate } from "./news";

export type NewShopCard = {
  date: string;
  vertical: VerticalKey;
  /** 札の文字(業種名) */
  tag: string;
  /** 店名(データのまま) */
  name: string;
  /** 町名(データにあれば) */
  town: string;
  href: string;
  photo: PhotoAttrs;
  /** 写真の出どころ(報告・検査用) */
  photoPath: string;
};

type Cand = NewShopCard & { ts: string; order: number };

/** 店の写真の置き場のものだけ(業種の飾り画像・AI 画像の置き場は入れない) */
const isShopPhotoPath = (u: string | undefined | null): u is string => !!u && (u.startsWith("/restaurants/") || u.startsWith("/_portal/vshops/")) && isUsableImage(u);

export async function getNewShopCards(limit = 3): Promise<NewShopCard[]> {
  const cands: Cand[] = [];
  const push = (vertical: VerticalKey, name: string, town: string, href: string, id: string, photoPath: string | undefined, order: number) => {
    const iso = ledger.stores[vertical]?.[id];
    if (!iso || !name || !isShopPhotoPath(photoPath)) return; // 日付が確かめられない・実際の写真が無い店は出さない
    const photo = shopPhoto(photoPath);
    if (!photo) return;
    cands.push({ ts: iso, date: jstDate(iso), vertical, tag: TAG[vertical], name, town, href, photo, photoPath, order });
  };

  const rest = await getAllRestaurants();
  rest.forEach((r, i) => push("gourmet", r.name, r.area || "", `/restaurant/${r.id}`, r.id, heroImagesOf(r)[0], i));
  for (const v of VERTICAL_ORDER) {
    if (v === "gourmet") continue;
    const places = await getPlaces(v);
    places.forEach((p, i) => {
      const first = (p.photos?.length ? p.photos.map((x) => x.path) : p.images?.length ? p.images : p.image ? [p.image] : []).find((u) => isUsableImage(u));
      push(v, p.name, p.cityName || "", `/${v}/shop/${p.id}`, p.id, first, i);
    });
  }

  const vo = (v: VerticalKey) => VERTICAL_ORDER.indexOf(v);
  cands.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : vo(a.vertical) - vo(b.vertical) || a.order - b.order));
  return cands.slice(0, limit).map(({ ts: _t, order: _o, ...x }) => x);
}
