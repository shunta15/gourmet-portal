import Machi2Page from "./Page";
import MachiShell from "./MachiShell";
import { cardPhotos } from "./cards";
import { latestNews } from "./news";
import { seasonNowJst } from "./season";
import "./airy.css";
import "./simple.css";

/**
 * 総合トップ(/)を「まち」改(machi2)で出す入口(components/portal/hproto/homeDesign.tsx が選ぶ。2026-10-29 まで本番だった見た目)。
 * 最初の季節を日本時間の今日の月で決めるので、app/portal-home/page.tsx の revalidate(1 時間)で作り直す。
 * 「読みもの」カード 2 枚(まちのストーリー・家族でおでかけ)は、リンク先の記事の実際の写真(記事ページと同じ取り方)。
 */
export function HomeShell({ children }: { children: React.ReactNode }) {
  return <MachiShell>{children}</MachiShell>;
}

export async function HomePage() {
  return <Machi2Page season={seasonNowJst()} news={latestNews(4)} cards={await cardPhotos()} />;
}
