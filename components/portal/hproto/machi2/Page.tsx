import Header from "./Header";
import Hero from "./Hero";
import Lower from "./Lower";
import type { CardPhotos } from "./cards";
import type { NewsRow } from "./news";
import MotionPlus from "./MotionPlus";
import "./motion-plus.css";
import type { Season } from "./season";
import "./prod.css";

/**
 * 総合トップの中身(app/portal-home が呼ぶ)。
 * season = 最初の画面の最初の季節(サーバーが日本時間の今日の月から決めて渡す)
 * news = 「まちの最新情報」4 行(特集記事の実データ。news.ts の latestNews)
 * cards = 「読みもの」カード 2 枚(まちのストーリー・家族でおでかけ)の写真。リンク先の記事の実際の写真(cards.ts の cardPhotos)
 */
export default function Page({ season, news, cards }: { season: Season; news: NewsRow[]; cards?: CardPhotos }) {
  return (
    <>
      <Header />
      <main className="h2-main">
        <Hero season={season} />
        <Lower news={news} cards={cards} />
        <MotionPlus />
      </main>
    </>
  );
}
