import { permanentRedirect } from "next/navigation";
import { assertPortalLive } from "@/lib/portal/launch";

// 宿の記事の一覧 /stay/article は、店舗紹介の一覧 /stay/shop へ恒久の転送(308)。2026-10-24 オーナー決定: 店 1 軒の記事のカードの一覧は作らず、店舗紹介にまとめる。
// 宿ごとの記事 /stay/article/{id} は残す(店のページの「特集記事を読む」・記事のページの「店舗詳細を見る」で行き来する)。公開スイッチ OFF のあいだは 404(assertPortalLive)。
export default function Page() {
  assertPortalLive();
  permanentRedirect("/stay/shop");
}
