import OpenSearchForm from "./OpenSearchForm";
import { GenreCards, RegionChips, SceneChips } from "./FindParts";
import type { OpenSearchData } from "@/lib/portal/noren/openSearch";
import "./opensearch.css";

/** 入口の「エリアからさがす」に出す地域の数（店の多い順の上位。残りは「すべての地域を見る」から。基準: スマホで長くなりすぎない 12 地域） */
export const ENTRANCE_REGION_COUNT = 12;

/**
 * グルメの入口（/gourmet）の「店をさがす」の節。暖簾が開ききった直後、「七つの章」の入口の前に置く。
 * リアル版（components/portal/noren-real/GourmetNorenHomeReal.tsx）と、スイッチが false のときの components/portal/pages/gourmet-noren-home.tsx の両方が、この 1 つの部品を使う。
 * 中身（上から）: 見出しと 1 行の説明（数はデータから）→ 業種からさがす（7 つの大分類。漢字 1 字・名称・件数の大きな札。押すと /search?cuisine=…）
 *   → エリアからさがす（店の多い地域の札 + 「すべての地域を見る」。押すと /region/<key>）→ 利用シーンからさがす（12 の札。押すと /scene/<slug>）→ 検索の箱（キーワード・エリア・業種）。
 * 件数は呼び出し側のサーバーが店のデータから数えて渡す（lib/portal/noren/openSearch.ts）。星・点数・口コミの件数・順位は出さない。
 */
export default function OpenSearch({ data }: { data: OpenSearchData }) {
  return (
    <section className="vOs" id="open-search" aria-labelledby="vOs-h">
      <div className="vOs-in">
        <header className="vOs-head vN-rv">
          <p className="vOs-k">
            店をさがす<span lang="en">Search</span>
          </p>
          <h2 id="vOs-h" className="vOs-h">
            店を、<em>さがす。</em>
          </h2>
          <p className="vOs-lead">全 {data.total} 軒を、言葉・エリア・業種・利用シーンからさがせます。</p>
        </header>

        <div className="vOs-blk vOs-blk--genre vN-rv" id="open-cuisine">
          <h3 className="vOs-h3">
            業種から<em>さがす。</em>
          </h3>
          <GenreCards cuisines={data.cuisines} />
          <p className="vOs-note">和・洋・中・麺・肉・酒・茶、七つの章と同じ分類です。1 軒が複数の分類に入ることがあります。</p>
        </div>

        <div className="vOs-blk vN-rv" id="open-area">
          <div className="vOs-blk-h">
            <h3 className="vOs-h3">
              エリアから<em>さがす。</em>
            </h3>
            <p className="vOs-note">店の多い {Math.min(ENTRANCE_REGION_COUNT, data.regions.length)} 地域。ほかの地域は「すべての地域を見る」から。</p>
          </div>
          <RegionChips regions={data.regions.slice(0, ENTRANCE_REGION_COUNT)} more={{ href: "/search", label: "すべての地域を見る" }} />
        </div>

        <div className="vOs-blk vN-rv" id="open-scene">
          <div className="vOs-blk-h">
            <h3 className="vOs-h3">
              利用シーンから<em>さがす。</em>
            </h3>
            <p className="vOs-note">デート、接待、一人飲みなど、{data.scenes.length} の場面から。</p>
          </div>
          <SceneChips scenes={data.scenes} />
        </div>

        <OpenSearchForm regions={data.regions} cuisines={data.cuisines} total={data.total} />
      </div>
    </section>
  );
}
