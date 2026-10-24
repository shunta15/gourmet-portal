import { notFoundMetadata } from "@/components/portal/pages/data";
import { SportsNotFoundPage } from "@/components/portal/sports/pages";

// 最初・探す・店・特集・記事(オーナーが決めたデザイン。見本2)の 404。外枠は InnerFrame(components/portal/sports/pages.tsx の SportsNotFoundPage)。
// 種類・エリア・利用シーンのページの 404 も app/sports/(sub)/not-found.tsx で同じ見た目。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <SportsNotFoundPage />;
}
