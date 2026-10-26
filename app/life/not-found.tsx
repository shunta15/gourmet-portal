import { notFoundMetadata } from "@/components/portal/pages/data";
import { LifeNotFoundPage } from "@/components/portal/life/pages";

// 最初・探す・店・特集・記事(オーナーが決めたデザイン。2026-10-26 の見本)の 404。外枠は LifeFrame(components/portal/life/pages.tsx の LifeNotFoundPage)。
// 種類・エリア・利用シーンのページの 404 も app/life/(sub)/not-found.tsx で同じ見た目。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <LifeNotFoundPage />;
}
