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
 * season = 最初の画面の最初の季節(サーバーが日本時間の今日の月から決めて渡す)
 * prod = 本番の形(app/portal-home が true で呼ぶ)。試作 /proto-home/machi2 と /mihon は渡さない(今のまま)。
 * news = 本番の形の「まちの最新情報」4 行(特集記事の実データ。news.ts の latestNews)
 * cards = 本番の形の「読みもの」カード 2 枚(まちのストーリー・家族でおでかけ)の写真。リンク先の記事の実際の写真(cards.ts の cardPhotos)。渡さない試作は今までの画像
 * airy = 試作 /proto-home/airy 用。流れる帯(マーキー)を出さない(本番は渡さない=今のまま)
 * still = 試作 /proto-home/still 用。最初の画面を 1 枚の絵にして季節の切り替えを止める(本番は渡さない=今のまま)
 * cats = 試作用。業種の節(見出し「今日はどんな楽しみを見つける？」+業種の札 8 枚+つる)を丸ごとこの中身に差し替える(Lower の `<section class="h2-cats h2-cats-x">` の中に描かれる)。渡さない本番・ほかの試作は今のまま
 */
const MARQ: [string, string][] = [["グルメ", "#f27b2f"], ["ビューティー", "#ee5d8e"], ["ボディケア", "#4aa84a"], ["ペット", "#8b6cf0"], ["ステイ", "#e9a410"], ["アクティビティ", "#2f8de0"], ["スポーツ", "#17a398"], ["くらし", "#7fa82f"]];

export default function Page({ mihon, season, prod = false, news, cards, airy = false, still = false, cats }: { mihon: boolean; season: Season; prod?: boolean; news?: NewsRow[]; cards?: CardPhotos; airy?: boolean; still?: boolean; cats?: React.ReactNode }) {
  return (
    <>
      <Header base={prod ? "/" : mihon ? "/proto-home/machi2/mihon" : "/proto-home/machi2"} prod={prod} />
      <main className="h2-main">
        <Hero mihon={mihon} season={season} prod={prod} still={still} />
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
        <Lower prod={prod} news={news} cards={cards} cats={cats} />
        <MotionPlus />
      </main>
    </>
  );
}
