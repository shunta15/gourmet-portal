import JsonLd from "@/components/portal/JsonLd";
import SpecialIndex from "@/components/portal/bcproto/green/article/SpecialIndex";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { VERTICALS } from "@/lib/verticals";
import { loadBsArticleItems } from "@/lib/portal/vert/bodyshop/articles";
import { SPECIALS } from "@/lib/portal/vert/bodygreen/special";
import { articleHref, specialHref } from "@/components/portal/bcproto/green/common/site";
import type { SpecialCardItem } from "@/components/portal/bcproto/green/article/SpecialFilter";

// 業種の特集記事の一覧(/bodycare/special)。静的なページ(件数ゲートの対象外。サイトマップには app/bodycare/(sub)/sitemap.ts で足している)。
// 公開スイッチ OFF のあいだは 404(assertPortalLive)。見た目は案4 の記事の型。
export const revalidate = 3600;

const PATH = "/bodycare/special";
const TITLE = "ボディケアの特集｜マチノワ ボディケア";
const DESCRIPTION = "ボディケアの特集の一覧です。店の特集記事・利用シーンの記事・業種の読みものを、種類ごとに絞り込んで読めます。整体・整骨院・鍼灸院・マッサージ・リラクゼーションのちがい、店を選ぶときに見るところ、土日も開いている店。法律の決まりと、店のデータにある事実だけを載せています。";

export function generateMetadata() {
  assertPortalLive();
  // 件数ゲートの対象外の静的ページ。index にするので count は十分な値(3 以上)を渡す
  return buildMetadata({ vertical: "bodycare", title: TITLE, description: DESCRIPTION, path: PATH, count: 3 });
}

export default async function Page() {
  assertPortalLive();
  const v = VERTICALS.bodycare;
  // 【2026-10-26 試作】3 種類の記事を種類ごとに絞り込める並び。業種の読みもの = 今ある 3 本。利用シーンの記事 = まだ無い(準備中の枠)。店の特集記事 = 記事のある店(特集 → 店 ID の順)
  const stores = await loadBsArticleItems();
  const items: SpecialCardItem[] = [
    ...SPECIALS.map((x): SpecialCardItem => ({ key: `r-${x.slug}`, kind: "reading", href: specialHref(x.slug), tag: "業種の読みもの", title: x.title, text: x.summary })),
    ...stores.map((x): SpecialCardItem => ({
      key: `s-${x.id}`,
      kind: "store",
      href: articleHref(x.id),
      tag: x.featured ? "店の特集記事" : "店の紹介記事",
      title: x.title,
      sub: `${x.name}　${x.area}`,
      text: x.lede,
      photo: x.photo ? { src: x.photo.src, alt: x.photo.alt } : undefined,
      color: x.color,
    })),
  ];
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: v.name, url: absUrl(v.path) },
          { name: "特集", url: absUrl(PATH) },
        ])}
      />
      <SpecialIndex items={items} />
    </>
  );
}
