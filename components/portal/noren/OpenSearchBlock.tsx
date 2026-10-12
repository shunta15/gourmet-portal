import Link from "next/link";
import BlockFonts from "./BlockFonts";
import { ArrowIcon, PinIcon, SearchIcon } from "./BlockSearchParts";
import type { OpenSearchData } from "@/lib/portal/noren/openSearch";
import type { BlockTile } from "@/lib/portal/noren/blockTop";
import type { JpArea } from "@/lib/portal/noren/jpBand";
import type { OpenView } from "@/lib/portal/noren/looks";
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
 * 上から: 見出し → 検索の箱の形のリンク（押すと「さがす」のページへ。ここでは入力しない）→ 業種 7 つの写真のタイル → 「地図で見つける」の帯（日本全体のイラスト地図 + 掲載店のある地方ごとのピン・地方名・件数。押すと「さがす」のその地方へ。それ以外の所とボタンは「さがす」のページへ）。利用シーンの札は置かない。
 * 暗い暖簾の画面との境目は、紙の縁（PaperEdge）。星・点数・口コミの件数・順位・宣伝文句は出さない。
 */
export default function OpenSearchBlock({ data, tiles, view }: { data: OpenSearchData; tiles: BlockTile[]; bandAreas?: JpArea[]; view: OpenView }) {
  const dark = view.tone === "dark";
  return (
    <section className={`vBkt ${dark ? "vBkt--dark" : "vBkt--block"} vBkt--band-${view.band}`} id="open-search" aria-labelledby="vBkt-h">
      <BlockFonts />
      {!dark && <PaperEdge pos="top" />}
      <div className="vBkt-top">
        <div className="vBkt-wrap">
          <header className="vBkt-head vN-rv">
            <p className="vBkt-k">店をさがす</p>
            <h2 id="vBkt-h" className="vBkt-h">
              店を、<em>さがす。</em>
            </h2>
            <p className="vBkt-lead">全 {data.total} 軒を、言葉・エリア・業種・利用シーンからさがせます。</p>
          </header>
          {view.box && (
            <div className="vN-rv">
              {/* 検索の箱: ここでは入力しない。押すと「さがす」のページへ送るリンク（2026-10-12 オーナー指示「検索の箱を押したら探すページに飛ぶように」）。見た目は箱のまま */}
              <div className="vBkt-sboxw">
                <p className="vBkt-sbox-cap">店名・エリア・駅名でさがす</p>
                <Link href="/search" className="vBkt-sbox vBkt-sbox--go" aria-label="「さがす」のページへ（店名・エリア・駅名・料理名でさがす）">
                  <span className="vBkt-sbox-area" aria-hidden="true">
                    <PinIcon size={18} />
                    <span className="vBkt-sbox-sel">エリアを選ぶ</span>
                  </span>
                  <span className="vBkt-sbox-ph" aria-hidden="true">店名・エリア・駅名・料理名でさがす</span>
                  <span className="vBkt-sbox-btn" aria-hidden="true">
                    <SearchIcon size={22} sw={2.4} />
                    <span>さがす</span>
                  </span>
                </Link>
              </div>
            </div>
          )}
          {/* 業種のタイルを出さない版（既定の dark）は、すぐ下の業種ごとの章（和食〜カフェ・甘味）へ目が行くよう、箱の下に 1 行 */}
          {!view.tiles && (
            <p className="vBkt-chapline vN-rv">
              <a href="#chapters">
                業種からさがす <span aria-hidden="true">↓</span>
                <small>（この下に、和食からカフェ・甘味まで）</small>
              </a>
            </p>
          )}
          {view.tiles && (
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
          )}
        </div>
      </div>

      {/* 「地図で見つける」の帯（日本の地図と地方のピン）は置かない（2026-10-13 オーナー指示「最初のページのこの部分いらない」）。地方から選ぶ地図は「さがす」のページ（/search）にある */}

      {/* 利用シーンの札は置かない（2026-10-12 オーナー指示「利用シーンから探すを除外して」）。この節は「さがす」のページへ送る入口（箱・地図のピン・ボタンのどれも /search へ） */}
      {!dark && <PaperEdge pos="bottom" />}
    </section>
  );
}
