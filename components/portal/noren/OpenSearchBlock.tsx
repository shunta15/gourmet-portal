import Link from "next/link";
import BlockFonts from "./BlockFonts";
import BlockTopForm from "./BlockTopForm";
import BlockTopMap from "./BlockTopMap";
import { ArrowIcon } from "./BlockSearchParts";
import type { MapPt } from "./ShopMap";
import type { OpenSearchData } from "@/lib/portal/noren/openSearch";
import type { BlockTile } from "@/lib/portal/noren/blockTop";
// 地図の部品（ShopMap の vMp- の見た目）の CSS は scenesearch.css にある（検索のページは ShopCard 経由で読む。入口は、ここで読む）
import "./scenesearch.css";
import "./blocktop.css";

/** 紙の縁（ざらっとした切り口）の輪郭。毎回同じ形（疑似乱数の種で決める）。viewBox は 1200×24 */
function edgePoints(seed: number, lo: number, hi: number, step = 10): string {
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  let y = (lo + hi) / 2;
  const pts: string[] = [];
  for (let x = 0; x <= 1200; x += step) {
    y += (rnd() - 0.5) * (hi - lo) * 0.9;
    y = Math.max(lo, Math.min(hi, y));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(" L");
}
const EDGE_BACK = `M0,24 L${edgePoints(7, 2, 9)} L1200,24 Z`;
const EDGE_FRONT = `M0,24 L${edgePoints(31, 8, 15)} L1200,24 Z`;

/** 暗い暖簾の画面との境目: 紙が重なって見える縁。後ろに生成りの紙を 1 枚、その上に白い紙。影つき。top は上の縁、bottom は下の縁（上下を反転） */
function PaperEdge({ pos }: { pos: "top" | "bottom" }) {
  return (
    <span className={`vBkt-edge vBkt-edge--${pos}`} aria-hidden="true">
      <svg viewBox="0 0 1200 24" preserveAspectRatio="none" focusable="false">
        <g transform={pos === "bottom" ? "translate(0 24) scale(1 -1)" : undefined}>
          <path d={EDGE_BACK} fill="#e9dfcb" />
          <path d={EDGE_FRONT} fill="#fff" />
        </g>
      </svg>
    </span>
  );
}

/**
 * グルメの入口（/gourmet）の「店をさがす」の節の block の見た目（参考画像 1 枚目の形。この節の中だけ明るい。lib/portal/noren/looks.ts の OPEN_SEARCH_LOOK）。
 * 上から: 見出し → 検索の箱（エリア + キーワード + 橙の丸いボタン）→ 業種 7 つの写真のタイル → 「地図で見つける」の帯（イラスト地図 + 橙と紺のピン + 白い枠の店の写真の札）→ 利用シーンの札（小さく）。
 * 暗い暖簾の画面との境目は、紙の縁（PaperEdge）。星・点数・口コミの件数・順位・宣伝文句は出さない。
 */
export default function OpenSearchBlock({ data, tiles, bandPts, bandRegion }: { data: OpenSearchData; tiles: BlockTile[]; bandPts: MapPt[]; bandRegion: string }) {
  return (
    <section className="vBkt" id="open-search" aria-labelledby="vBkt-h">
      <BlockFonts />
      <PaperEdge pos="top" />
      <div className="vBkt-top">
        <div className="vBkt-wrap">
          <header className="vBkt-head vN-rv">
            <p className="vBkt-k">店をさがす</p>
            <h2 id="vBkt-h" className="vBkt-h">
              店を、<em>さがす。</em>
            </h2>
            <p className="vBkt-lead">全 {data.total} 軒を、言葉・エリア・業種・利用シーンからさがせます。</p>
          </header>
          <div className="vN-rv">
            <BlockTopForm regions={data.regions} />
          </div>
          <ul className="vBkt-tiles vN-rv" aria-label="業種から探す" id="open-cuisine">
            {tiles.map((t) => (
              <li key={t.key}>
                <Link href={`/search?cuisine=${encodeURIComponent(t.label)}`} className="vBkt-tile">
                  {t.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.img} alt="" loading="lazy" decoding="async" />
                  )}
                  <span className="vBkt-tile-t">
                    <b>{t.label}</b>
                    <small>{t.count}軒</small>
                  </span>
                  <span className="vBkt-circ" aria-hidden="true">
                    <ArrowIcon size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BlockTopMap pts={bandPts} regionKey={bandRegion}>
        <div className="vBkt-fade" aria-hidden="true" />
        <div className="vBkt-bt" id="open-area">
          <div className="vBkt-bt-in vN-rv">
            <p className="vBkt-or">地図で見つける</p>
            <h2 className="vBkt-bh">今気になる、あの店。</h2>
            <p className="vBkt-bp">
              マップから探して、
              <br />
              街を歩いて、おいしい出会いを。
            </p>
            <Link href="/search?tab=area" className="vBkt-btn">
              エリアから探す <ArrowIcon />
            </Link>
          </div>
        </div>
        <p className="vBkt-credit">地図: 国土地理院ベクトルタイルをもとに作成</p>
      </BlockTopMap>

      <div className="vBkt-scn" id="open-scene">
        <div className="vBkt-wrap">
          <h3 className="vBkt-sh">利用シーンから探す</h3>
          <ul className="vBkt-chips">
            {data.scenes.map((s) => (
              <li key={s.slug}>
                <Link href={`/scene/${s.slug}`} className="vBkt-chip">
                  <span>{s.name}</span>
                  <i>{s.count}</i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <PaperEdge pos="bottom" />
    </section>
  );
}
