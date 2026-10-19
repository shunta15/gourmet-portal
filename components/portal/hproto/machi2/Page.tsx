import Header from "./Header";
import Hero from "./Hero";
import Lower from "./Lower";
import type { Season } from "./season";

/** season = 最初の画面の最初の季節(サーバーが日本時間の今日の月から決めて渡す) */
export default function Page({ mihon, season }: { mihon: boolean; season: Season }) {
  return (
    <>
      <Header base={mihon ? "/proto-home/machi2/mihon" : "/proto-home/machi2"} />
      <main className="h2-main">
        <Hero mihon={mihon} season={season} />
        <Lower />
      </main>
    </>
  );
}
