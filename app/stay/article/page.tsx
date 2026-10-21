import { notFound } from "next/navigation";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayArticles from "@/components/portal/stayproto/decided/article/live/StayArticles";
import { isStayDecided } from "@/lib/portal/stayDesign";
import { assertPortalLive } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { VERTICALS } from "@/lib/verticals";

// 宿の記事の一覧(決定デザイン ④の世界)。/stay/article
// STAY_DESIGN が "legacy" のあいだは 404(これまでのステイには記事の一覧が無い。/stay/scene/{slug} 等はそのまま)。
// 記事のリンク先は宿の記事 /stay/article/{id}。外枠は StayFrame。
// robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex。buildMetadata の count)。
export async function generateMetadata() {
  assertPortalLive();
  if (!isStayDecided()) return notFoundMetadata();
  const v = VERTICALS.stay;
  return buildMetadata({
    vertical: "stay",
    title: `宿の記事｜${v.brand}`,
    description: "実在の宿を一軒ずつ紹介する記事の一覧です。所在地やチェックイン・チェックアウトなど、公式サイトなどで確認できた情報をまとめています。",
    path: `${v.path}/article`,
    count: await countPlaces("stay"),
  });
}

export default function Page() {
  assertPortalLive();
  if (!isStayDecided()) notFound();
  return (
    <StayFrame>
      <StayArticles />
    </StayFrame>
  );
}
