import Link from "next/link";
import { IMG, CATS, CAT_R, P4Header, P4Footer } from "./P4Chrome";

// 総合の特集一覧(/special)。8 業種それぞれの特集ページへの入口を、総合トップ(見本4)と同じ雰囲気(生成りの地・丸い写真・明朝)で並べる。
// 2026-10-29 オーナー指示「全部グルメに飛ぶようになってるのやめてくれません?」。見出しは「特集」だけ(新しいコピーは作らない)。
// 行き先は、各業種の特集の一覧。アクティビティだけは特集の一覧がまだ無いので、業種の最初のページ(/activity)。
const SPECIAL_HREF: Record<string, string> = {
  gourmet: "/feature",
  beauty: "/beauty/special",
  bodycare: "/bodycare/special",
  pet: "/pet/special",
  stay: "/stay/special",
  activity: "/activity",
  sports: "/sports/special",
  life: "/life/special",
};

export default function P4Special() {
  return (
    <div className="p4-page">
      <P4Header />
      <section className="p4-spsec" aria-label="特集">
        <h1 className="p4-h2 p4-sp-h">特集</h1>
        <div className="p4-cats p4-sp-cats">
          {CATS.map(([k, ja, en], i) => (
            <Link key={k} href={SPECIAL_HREF[k]} className="p4-cat">
              <img src={IMG + "n_cat_" + k + ".webp"} alt="" style={{ borderRadius: CAT_R[i % 4] }} />
              <span className="p4-cat-ja">{ja}</span>
              <span className="p4-cat-en">{en}</span>
            </Link>
          ))}
        </div>
      </section>
      <P4Footer />
    </div>
  );
}
