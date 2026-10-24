import JsonLd from "@/components/portal/JsonLd";
import SpecialIndex from "@/components/portal/bcproto/green/article/SpecialIndex";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { VERTICALS } from "@/lib/verticals";

// 業種の特集記事の一覧(/bodycare/special)。静的なページ(件数ゲートの対象外。サイトマップには app/bodycare/(sub)/sitemap.ts で足している)。
// 公開スイッチ OFF のあいだは 404(assertPortalLive)。見た目は案4 の記事の型。
export const revalidate = 3600;

const PATH = "/bodycare/special";
const TITLE = "ボディケアの特集記事｜マチノワ ボディケア";
const DESCRIPTION = "ボディケアの店を探すときに役立つ特集記事の一覧です。整体・整骨院・鍼灸院・マッサージ・リラクゼーションのちがい、店を選ぶときに見るところ、土日も開いている店。法律の決まりと、店のデータにある事実だけを載せています。";

export function generateMetadata() {
  assertPortalLive();
  // 件数ゲートの対象外の静的ページ。index にするので count は十分な値(3 以上)を渡す
  return buildMetadata({ vertical: "bodycare", title: TITLE, description: DESCRIPTION, path: PATH, count: 3 });
}

export default function Page() {
  assertPortalLive();
  const v = VERTICALS.bodycare;
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: v.name, url: absUrl(v.path) },
          { name: "特集記事", url: absUrl(PATH) },
        ])}
      />
      <SpecialIndex />
    </>
  );
}
