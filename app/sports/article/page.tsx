import { permanentRedirect } from "next/navigation";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { vkLinks } from "@/components/portal/vkit/config";
import { assertPortalLive } from "@/lib/portal/launch";

// 店の記事のカードの一覧だった /sports/article は、店舗紹介の一覧 /sports/shop へ恒久の転送(308。オーナー決定 2026-10-23。ページは消さずに転送)。
// 店 1 軒の記事のページ /sports/article/{店 ID} は、これまでどおり残る(店のページの「特集記事を読む」の行き先)。特集のページは /sports/special。
// 転送するページなので検索エンジンには載せない。公開スイッチ OFF のあいだは 404(assertPortalLive)。
export function generateMetadata() {
  assertPortalLive();
  return notFoundMetadata();
}

export default function Page(): never {
  assertPortalLive();
  permanentRedirect(vkLinks(sportsCfg).shops);
}
