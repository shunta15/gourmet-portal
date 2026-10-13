import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreviewOrLocal } from "@/lib/portal/launch";
import { loadBsShop } from "@/lib/portal/vert/bodyshop/model";
import ShopA from "@/components/portal/vert/bodyshop/ShopA";
import ShopB from "@/components/portal/vert/bodyshop/ShopB";
import ShopC from "@/components/portal/vert/bodyshop/ShopC";

// ボディケアの店のページの見本 3 案(プレビュー・ローカル専用。門は layout.tsx と、ここの isPreviewOrLocal)。
// 見る URL は /bodycare/shop/<id>?v=1|2|3(next.config.ts の rewrites がここへ差し替える。lib/portal/vert/bodyshopPreview.ts)。
// 動的に描く(静的生成しない)。検索エンジンには載せない。
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; v: string }> };

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = isPreviewOrLocal() ? await loadBsShop(safeDecode(id)) : null;
  return { title: shop ? `${shop.name}｜ボディケア(見本)` : "ページが見つかりません", robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  if (!isPreviewOrLocal()) notFound();
  const { id, v } = await params;
  const n = Number(v);
  if (n !== 1 && n !== 2 && n !== 3) notFound();
  const shop = await loadBsShop(safeDecode(id));
  if (!shop) notFound();
  return n === 1 ? <ShopA shop={shop} v={n} /> : n === 2 ? <ShopB shop={shop} v={n} /> : <ShopC shop={shop} v={n} />;
}
