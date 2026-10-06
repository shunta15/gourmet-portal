/**
 * おまかせ提案。/omakase
 * 4 つの質問（どこで／誰と／予算／気分）に答えると、条件に合う店を 3 軒ほど出す（本体は components/portal/omakase/OmakaseApp.tsx）。
 * 店・判定はすべて実データ（lib/portal/omakase.ts がこだわり条件と同じ判定から小さな表を作る）。星・点数・口コミ数・「おすすめ」は出さない。
 *
 * SEO（lib/seo の作法）: 答えを 1 つでも URL に持つページは薄い・重複なので noindex（canonical は /omakase）。
 * 答えの無い /omakase だけが、掲載店が 3 店以上あるとき index 対象（lib/seo/gate.ts）。サイトマップには載せない（入口は /gourmet のリンク）。
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { assertPortalLive } from "@/lib/portal/launch";
import { loadOmakaseData } from "@/lib/portal/omakase";
import { answeredCount, parseOmakase } from "@/lib/portal/omakaseDefs";
import { buildMetadata } from "@/lib/seo/meta";
import Breadcrumbs from "../Breadcrumbs";
import PortalFonts from "../PortalFonts";
import OmakaseApp from "../omakase/OmakaseApp";

type SP = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SP> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** URL に、答え・見直し・結果の並びのどれかがあるか（あれば、答えの状態のページ） */
function hasState(sp: SP): boolean {
  return ["r", "p", "who", "b", "m", "q", "s", "n"].some((k) => (first(sp[k]) ?? "") !== "");
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  assertPortalLive();
  const data = await loadOmakaseData();
  const sp = await searchParams;
  const st = parseOmakase((k) => first(sp[k]), data.shownBands).st;
  const stated = hasState(sp) || answeredCount(st) > 0;
  return buildMetadata({
    vertical: "portal",
    title: "おまかせ提案｜4つの質問で、条件に合う店を｜マチノワ",
    description: `どこで・誰と・予算・気分の4つに答えると、掲載店${data.rows.length}店から条件に合う店を3軒ほど出します。店の案内に書かれた事実だけで絞り、評価や人気では選びません。`,
    path: "/omakase",
    // 答えの状態の URL は index にしない（count 0 → noindex）。何も答えていない /omakase は掲載店の数で判定
    count: stated ? 0 : data.rows.length,
  });
}

export default async function Page() {
  assertPortalLive();
  const data = await loadOmakaseData();
  return (
    <div className="om-page">
      <PortalFonts />
      <div className="om-crumbs">
        <Breadcrumbs
          items={[
            { name: "マチノワ", href: "/" },
            { name: "おまかせ提案", href: "/omakase" },
          ]}
        />
      </div>
      <Suspense fallback={null}>
        <OmakaseApp data={data} />
      </Suspense>
      <noscript>
        <p className="om-noscript">このページは JavaScript を使います。店を探すには、<a href="/search">さがす</a>をお使いください。</p>
      </noscript>
      <section className="om-how" aria-labelledby="om-how-h">
        <div className="om-how-in">
          <h2 id="om-how-h">このしくみについて</h2>
          <ul>
            <li>店のデータに書いてあることだけで、絞っています。書いていないこと（不明）は、その条件を選んだときは含めません。</li>
            <li>設備や特徴は、店の案内・タグに「記載がある」店です。最新の情報は店にご確認ください。</li>
            <li>当てはまる店のなかからの並びは、評価や人気ではなく、順不同です。「ほかの候補を見る」で入れ替わります。</li>
            <li>各質問の結び付けは、選択肢の下に書いてあります。答えは URL に残るので、そのまま共有できます。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
