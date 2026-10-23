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
 * airy = 流れる帯(マーキー)を出さない(lib/portal/homeDesign.ts の HOME_AIRY)
 */
const MARQ: [string, string][] = [["グルメ", "#f27b2f"], ["ビューティー", "#ee5d8e"], ["ボディケア", "#4aa84a"], ["ペット", "#8b6cf0"], ["ステイ", "#e9a410"], ["アクティビティ", "#2f8de0"], ["スポーツ", "#17a398"], ["くらし", "#7fa82f"]];

export default function Page({ season, news, cards, airy = false }: { season: Season; news: NewsRow[]; cards?: CardPhotos; airy?: boolean }) {
  return (
    <>
      <Header />
      <main className="h2-main">
        <Hero season={season} />
        {/* 流れる帯(マーキー): 業種の名前が絶えず流れる。画面外では止まる */}
        {!airy && <div className="h2p-marq" aria-hidden="true">
          <div className="h2p-track">
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className="h2p-set">
                {MARQ.map(([t, c]) => (<span key={t} className="h2p-mi" style={{ ["--c" as string]: c }}><i />{t}</span>))}
              </span>
            ))}
          </div>
        </div>}
        <Lower news={news} cards={cards} />
        <MotionPlus />
      </main>
    </>
  );
}
