import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListHero, TOP_CRUMB } from "@/components/portal/noren/FeatureList";
import { SceneTile } from "@/components/portal/noren/ShopCard";
import { SCENES } from "@/lib/scenes";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_SCENE_REWRITE } from "@/lib/portal/noren/rewrites";

// シーン一覧（/scene）の暖簾版の実体（内部のパス）。公開スイッチ ON のとき、/scene が next.config.ts の rewrites でここに来る
// （ブラウザの URL・canonical は /scene のまま）。枠は app/gourmet/layout.tsx。metadata・シーンの並びは、今の app/scene/page.tsx と同じ。
// OFF のあいだ・NOREN_SCENE_REWRITE=false のあいだは 404。
export const metadata: Metadata = {
  title: "利用シーンから探す | マチノワ",
  description: "デート・接待・一人飲み・記念日など、利用シーンから店を選ぶ。",
  alternates: { canonical: "/scene" },
};

export default function Page() {
  assertPortalLive();
  if (!NOREN_SCENE_REWRITE) notFound();
  return (
    <>
      <ListHero crumbs={[TOP_CRUMB, { label: "シーン" }]} eyebrow="利用シーンから探す" eyebrowEn="Scene" cloth="利用シーン">
        <h1 id="vI-h1" className="vI-h1 vSc-lead">
          気分から、<em>選ぶ。</em>
        </h1>
        <p className="vI-lead vSc-lead">デート・接待・一人飲み・記念日。利用シーンから、店を探せます。</p>
      </ListHero>

      <section className="vN-paper vI-paper" aria-labelledby="vSc-h-scenes">
        <div className="vI-sec-in">
          <div className="vI-sh vN-rv">
            <div>
              <h2 id="vSc-h-scenes" className="vF-h2d">シーンを、<em>選ぶ。</em></h2>
              <p>{SCENES.length} の利用シーン。気分に合うものを押すと、その店の一覧に進みます。</p>
            </div>
          </div>
          <ul className="vSc-scn vN-rv">
            {SCENES.map((s, i) => (
              <li key={s.slug}>
                <SceneTile no={i + 1} name={s.name} tagline={s.tagline} href={`/scene/${s.slug}`} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="vI-cta vN-rv">
        <Link href="/search" className="vI-btn" data-cursor="SEARCH">キーワードで探す →</Link>
        <Link href="/feature" className="vI-ulink" data-cursor="ALL">特集記事を読む</Link>
      </div>
    </>
  );
}
