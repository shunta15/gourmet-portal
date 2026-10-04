/**
 * グルメの店の SNS・公式サイトのボタン（サーバー専用。lib/data を読むのでクライアントから import しない）。
 *
 * 店の一覧・個別ページは Supabase の行を優先して返すが、DB の行には SNS の欄が無い（lib/db/restaurants.ts の DbRestaurantRow）。
 * そのため DB の行から来た店では instagram などが落ちる。コード側（lib/data.ts の RESTAURANTS）に同じ店 ID の値があれば、
 * DB の行に値が無い項目だけ、そちらで補う（新しい値を作るわけではなく、すでにデータにある値を使う）。
 */
import { RESTAURANTS, type Restaurant } from "@/lib/data";
import type { Place } from "@/lib/places/types";
import { socialLinks, SOCIAL_ORDER, type ShopLink, type ShopSocial, type SocialKind } from "./sns";

const CODE_BY_ID = new Map(RESTAURANTS.map((r) => [r.id, r]));

/** 店の SNS の欄（DB の行に無い項目はコード側で補う） */
export function restaurantSocial(r: Restaurant): ShopSocial {
  const code = CODE_BY_ID.get(r.id);
  const out: ShopSocial = {};
  for (const k of SOCIAL_ORDER as SocialKind[]) {
    out[k] = r[k] ?? code?.[k];
  }
  return out;
}

export function restaurantSocialLinks(r: Restaurant): ShopLink[] {
  return socialLinks(restaurantSocial(r));
}

/** 店（Place）の SNS の欄。グルメは restaurantSocial と同じく、DB の行に無い項目をコード側で補う */
export function placeSocial(p: Place): ShopSocial {
  const code = p.vertical === "gourmet" ? CODE_BY_ID.get(p.id) : undefined;
  const out: ShopSocial = {};
  for (const k of SOCIAL_ORDER as SocialKind[]) {
    out[k] = p[k] ?? code?.[k];
  }
  return out;
}
