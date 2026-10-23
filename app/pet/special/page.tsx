import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { PetSpecialIndex } from "@/components/portal/petproto/decided/special/PetSpecial";
import { assertPortalLive } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// ペットの特集記事の一覧(メニューの「特集」の行き先)。/pet/special — 利用シーン記事 + 業種の特集記事 3 本(lib/specials/pet.json)。店 1 軒の記事は並べない。
// 見た目はボディケアの /bodycare/special を手本に、ペットの部品で組む。robots は他の一覧と同じ gate(掲載が 3 件未満なら noindex)。
export const revalidate = 3600;

export async function generateMetadata() {
  assertPortalLive();
  const v = VERTICALS.pet;
  return buildMetadata({
    vertical: "pet",
    title: `ペットの特集記事｜${v.brand}`,
    description: "ペットと行けるお店を探すときに読む特集記事の一覧です。ペットショップ・トリミング・ペットホテル・カフェ・動物病院のちがい、お店を選ぶときに見るところ、動物とふれあえるお店。",
    path: "/pet/special",
    count: await countPlaces("pet"),
  });
}

export default function Page() {
  return (
    <PetFrame>
      <PetSpecialIndex />
    </PetFrame>
  );
}
