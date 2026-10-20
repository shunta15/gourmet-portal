import Header from "./Header";
import Hero from "./Hero";
import Lower from "./Lower";
import type { NewsRow } from "./news";
import MotionPlus from "./MotionPlus";
import "./motion-plus.css";
import type { Season } from "./season";
import "./prod.css";

/**
 * season = 最初の画面の最初の季節(サーバーが日本時間の今日の月から決めて渡す)
 * prod = 本番の形(app/portal-home が true で呼ぶ)。試作 /proto-home/machi2 と /mihon は渡さない(今のまま)。
 * news = 本番の形の「まちの最新情報」4 行(特集記事の実データ。news.ts の latestNews)
 */
const MARQ: [string, string][] = [["グルメ", "#f27b2f"], ["ビューティー", "#ee5d8e"], ["ボディケア", "#4aa84a"], ["ペット", "#8b6cf0"], ["おでかけ", "#2f8de0"], ["ステイ", "#e9a410"]];

export default function Page({ mihon, season, prod = false, news }: { mihon: boolean; season: Season; prod?: boolean; news?: NewsRow[] }) {
  return (
    <>
      <Header base={prod ? "/" : mihon ? "/proto-home/machi2/mihon" : "/proto-home/machi2"} prod={prod} />
      <main className="h2-main">
        <Hero mihon={mihon} season={season} prod={prod} />
        {/* 流れる帯(マーキー): 業種の名前が絶えず流れる。画面外では止まる */}
        <div className="h2p-marq" aria-hidden="true">
          <div className="h2p-track">
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className="h2p-set">
                {MARQ.map(([t, c]) => (<span key={t} className="h2p-mi" style={{ ["--c" as string]: c }}><i />{t}</span>))}
              </span>
            ))}
          </div>
        </div>
        <Lower prod={prod} news={news} />
        <MotionPlus />
      </main>
    </>
  );
}
