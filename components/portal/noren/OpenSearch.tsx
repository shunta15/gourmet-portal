import Link from "next/link";
import OpenSearchForm from "./OpenSearchForm";
import type { OpenSearchData } from "@/lib/portal/noren/openSearch";
import "./opensearch.css";

/**
 * グルメの入口（/gourmet）の「店をさがす」の節。暖簾が開ききった直後、「七つの章」の入口の前に置く。
 * リアル版（components/portal/noren-real/GourmetNorenHomeReal.tsx）と、スイッチが false のときの components/portal/pages/gourmet-noren-home.tsx の両方が、この 1 つの部品を使う。
 * 中身: 見出しと 1 行の説明（数はデータから）→ 検索の箱（キーワード・エリア・業種）→ 業種からさがす（全分類の札と件数）→ 利用シーンからさがす（12 の札）。
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

        <OpenSearchForm regions={data.regions} cuisines={data.cuisines} total={data.total} />

        <div className="vOs-blk vN-rv" id="open-cuisine">
          <div className="vOs-blk-h">
            <h3 className="vOs-h3">
              業種から<em>さがす。</em>
            </h3>
            <p className="vOs-note">和・洋・中・麺・肉・酒・茶、七つの章と同じ分類です。1 軒が複数の分類に入ることがあります。</p>
          </div>
          <ul className="vOs-chips" aria-label="業種の分類">
            {data.cuisines.map((c) => (
              <li key={c.label}>
                <Link href={`/search?cuisine=${encodeURIComponent(c.label)}`} className="vOs-chip" data-cursor="GO">
                  <span>{c.label}</span>
                  <i>
                    {c.count}
                    <small>軒</small>
                  </i>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="vOs-blk vN-rv" id="open-scene">
          <div className="vOs-blk-h">
            <h3 className="vOs-h3">
              利用シーンから<em>さがす。</em>
            </h3>
            <p className="vOs-note">デート、接待、一人飲みなど、{data.scenes.length} の場面から。</p>
          </div>
          <ul className="vOs-chips" aria-label="利用シーン">
            {data.scenes.map((s) => (
              <li key={s.slug}>
                <Link href={`/scene/${s.slug}`} className="vOs-chip" data-cursor="GO">
                  <span>{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
