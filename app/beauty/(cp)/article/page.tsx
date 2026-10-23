import { permanentRedirect } from "next/navigation";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { shopListHref } from "@/lib/portal/colorplay/shopList";
import { assertPortalLive } from "@/lib/portal/launch";

// 店の記事の一覧(/beauty/article。これまでは店 1 軒の記事のカードの一覧)は、2026-10-24 のオーナー決定で店舗紹介の一覧(/beauty/shop)へ恒久の転送(308)。
// 引数(kind・n)つきの URL も同じ行き先(店舗紹介に絞り込みは無い)。店 1 軒の記事のページ(/beauty/article/{店 ID})は今のまま残る。
// 公開スイッチ OFF のあいだは 404(assertPortalLive)。
export function generateMetadata() {
  assertPortalLive();
  return {};
}

export default function Page(): never {
  assertPortalLive();
  permanentRedirect(shopListHref(BEAUTY_SITE));
}
