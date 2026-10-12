/**
 * おまかせ提案 /omakase の新しい見た目（サーバー）。metadata・質問・結果の仕組みは components/portal/pages/omakase.tsx・components/portal/omakase/* のまま。
 * 枠は周りのページと同じ（PeripheryFrame: 和紙の地・上端の竿の帯・ヘッダー・フッター）。質問と結果は今のおまかせ提案（墨・朱・明朝）をそのまま、周りのページの色に重ねる（.pp-om）。
 * 結果の店の札は /search の結果の札（BlockCard）と同じ部品・同じ事実の行。字は今のページと同じ。
 */
import "../noren/blocksearch.css";
import "../omakase.css";
import BlockFonts from "../noren/BlockFonts";
import Breadcrumbs from "../Breadcrumbs";
import PortalFonts from "../PortalFonts";
import OmakaseApp from "../omakase/OmakaseApp";
import type { OmakaseData } from "@/lib/portal/omakaseDefs";
import { Suspense } from "react";
import PeripheryFrame from "./PeripheryFrame";

export default function OmakaseView({ data }: { data: OmakaseData }) {
  return (
    <PeripheryFrame>
      <PortalFonts />
      <BlockFonts />
      <div className="pp-om">
        <div className="pp-om-crumbs">
          <Breadcrumbs
            className="pp-crumbs"
            items={[
              { name: "マチノワ", href: "/" },
              { name: "おまかせ提案", href: "/omakase" },
            ]}
          />
        </div>
        <Suspense fallback={null}>
          <OmakaseApp data={data} blockCards />
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
    </PeripheryFrame>
  );
}
