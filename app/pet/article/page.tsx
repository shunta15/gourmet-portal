import { permanentRedirect } from "next/navigation";
import { assertPortalLive } from "@/lib/portal/launch";

// 店の記事の一覧 /pet/article は、店舗紹介の一覧 /pet/shop へ恒久の転送(308)。2026-10-24 オーナー決定: 店 1 軒の記事は店のページの中にあり、一覧は店舗紹介にまとめる。
// ペットは店の記事が店のページ /pet/shop/{id} の中に入っているので、記事ごとの URL は無い(転送はこの一覧だけ)。公開スイッチ OFF のあいだは 404(assertPortalLive)。
export default function Page() {
  assertPortalLive();
  permanentRedirect("/pet/shop");
}
