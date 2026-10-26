import { notFoundMetadata } from "@/components/portal/pages/data";
import { LifeNotFoundPage } from "@/components/portal/life/pages";

// 種類・エリア・利用シーンのページ(app/life/(sub)/(portal)/ の下。総合サイトの外枠)の 404。
// 存在しない URL(/life/zzz など)がここに来ても、くらしの見本の 404 を出す(外枠は LifeFrame)。
// (portal) のレイアウトの外に置いているので、総合サイトのヘッダー・フッターは出ない。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <LifeNotFoundPage />;
}
