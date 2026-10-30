import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { StaySpecialIndex } from "@/components/portal/stayproto/decided/special/StaySpecial";
import { assertPortalLive } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// ステイの特集記事の一覧(メニューの「特集」の行き先)。/stay/special — 利用シーン記事 + 業種の特集記事 3 本(lib/specials/stay.json)。店 1 軒の記事は並べない。
// 見た目はボディケアの /bodycare/special を手本に、ステイの部品で組む。robots は他の一覧と同じ gate(掲載が 3 件未満なら noindex)。

export async function generateMetadata() {
  assertPortalLive();
  const v = VERTICALS.stay;
  return buildMetadata({
    vertical: "stay",
    title: `ステイの特集記事｜${v.brand}`,
    description: "宿を選ぶときに読む特集記事の一覧です。一棟貸し・キャンプ場・民宿・ホテル・旅館のちがい、宿を選ぶときに見るところ、ペットと泊まれる宿。",
    path: "/stay/special",
    count: await countPlaces("stay"),
  });
}

export default function Page() {
  assertPortalLive();
  return (
    <StayFrame>
      <StaySpecialIndex />
    </StayFrame>
  );
}
