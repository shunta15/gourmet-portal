import type { Metadata } from "next";
import GourmetNorenShop from "@/components/portal/pages/gourmet-noren-shop";
import { getRestaurantById } from "@/lib/db/restaurants";
import { restaurantTitle } from "@/lib/seoText";
import { SAMPLE_LINKS } from "@/lib/portal/noren/nav";

// 暖簾の見本（店舗紹介ページ）。今の /restaurant/[id] と同じデータ・同じ取り方で、同じ中身を出す。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx）。
// 中身は components/portal/pages/gourmet-noren-shop.tsx（本番の /restaurant/[id] と共通。行き先だけ見本のページ）。
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getRestaurantById(id);
  if (!r) return { title: "店舗が見つかりません — マチノワ" };
  return { title: restaurantTitle(r), robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GourmetNorenShop id={id} links={SAMPLE_LINKS} />;
}
