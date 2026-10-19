import Header from "./Header";
import Hero from "./Hero";
import Lower from "./Lower";
import type { NewsRow } from "./news";
import type { Season } from "./season";
import "./prod.css";

/**
 * season = 最初の画面の最初の季節(サーバーが日本時間の今日の月から決めて渡す)
 * prod = 本番の形(app/portal-home が true で呼ぶ)。試作 /proto-home/machi2 と /mihon は渡さない(今のまま)。
 * news = 本番の形の「まちの最新情報」4 行(特集記事の実データ。news.ts の latestNews)
 */
export default function Page({ mihon, season, prod = false, news }: { mihon: boolean; season: Season; prod?: boolean; news?: NewsRow[] }) {
  return (
    <>
      <Header base={prod ? "/" : mihon ? "/proto-home/machi2/mihon" : "/proto-home/machi2"} prod={prod} />
      <main className="h2-main">
        <Hero mihon={mihon} season={season} prod={prod} />
        <Lower prod={prod} news={news} />
      </main>
    </>
  );
}
