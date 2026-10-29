import Link from "next/link";
import { IMG, CATS, CAT_R, P4Header, P4Footer } from "./P4Chrome";

// 総合の店舗紹介(/shop)。8 業種それぞれの「店舗紹介」(店舗詳細+店の特集記事の一覧)への入口を、総合トップ(見本4)と同じ雰囲気(生成りの地・丸い写真・明朝)で並べる。
// 2026-10-29 オーナー決定「総合の店舗紹介を新しく作る」。見出し「店舗紹介」・説明「マチノワで紹介しているお店をまとめています。」はオーナー決定の言葉。ほかのキャッチ・英字・件数は足さない。
// 行き先は、各業種のナビの「店舗紹介」と同じ。グルメだけは公開の URL が /restaurant(/gourmet/restaurant は 308 でここへ来る。lib/portal/noren/nav.ts の MENU_SHOPS)。ほかの 7 業種は /{業種}/shop。
const SHOP_HREF: Record<string, string> = {
  gourmet: "/restaurant",
  beauty: "/beauty/shop",
  bodycare: "/bodycare/shop",
  pet: "/pet/shop",
  stay: "/stay/shop",
  activity: "/activity/shop",
  sports: "/sports/shop",
  life: "/life/shop",
};

export default function P4Shop() {
  return (
    <div className="p4-page">
      <P4Header />
      <section className="p4-spsec" aria-label="店舗紹介">
        <h1 className="p4-h2 p4-sp-h">店舗紹介</h1>
        <p className="p4-sub p4-shop-lead">マチノワで紹介しているお店をまとめています。</p>
        <div className="p4-cats p4-sp-cats">
          {CATS.map(([k, ja], i) => (
            <Link key={k} href={SHOP_HREF[k]} className="p4-cat">
              <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ borderRadius: CAT_R[i % 4] }} />
              <span className="p4-cat-ja">{ja}</span>
            </Link>
          ))}
        </div>
      </section>
      <P4Footer />
    </div>
  );
}
