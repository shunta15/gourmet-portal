import { notFound } from "next/navigation";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetArticles from "@/components/portal/petproto/decided/article/live/PetArticles";
import { isPetDecided } from "@/lib/portal/petDesign";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { VERTICALS } from "@/lib/verticals";

// ペットの記事の一覧(決定デザイン ④。店の特集記事・紹介記事と、種類・利用シーンの入口)。/pet/article
// PET_DESIGN が "legacy" のあいだは 404(これまでのペットには記事の一覧が無い。/pet/scene/{slug} 等はそのまま)。
// 記事のリンク先は店のページ /pet/shop/{id}(店の詳細と特集記事は同じページ)。外枠は PetFrame。
// robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex。buildMetadata の count)。
export async function generateMetadata() {
  if (!isPetDecided()) return notFoundMetadata();
  const v = VERTICALS.pet;
  return buildMetadata({
    vertical: "pet",
    title: `ペットの記事・利用シーン｜${v.brand}`,
    description: "ペットと行けるお店の紹介記事と、種類・利用シーンから探せるページです。メニューや設備、行き方など、確認できた情報をまとめています。",
    path: `${v.path}/article`,
    count: await countPlaces("pet"),
  });
}

export default function Page() {
  if (!isPetDecided()) notFound();
  return (
    <PetFrame>
      <PetArticles />
    </PetFrame>
  );
}
