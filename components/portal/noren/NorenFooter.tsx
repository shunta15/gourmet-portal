import Link from "next/link";
import { menuWithTop } from "@/lib/portal/noren/nav";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";
import FootSmall from "@/components/portal/FootSmall";
import NorenNewsletter from "./NorenNewsletter";

/**
 * 暖簾の共通フッター（見本 /proto-noren と本番の /gourmet で共通）。竿の下に、ロゴとニュースレター、メニューと同じ行き先のナビゲーション（トップ・さがす・店舗紹介・特集）、
 * その下に小さな文字の 1 行（マチノワ トップ・編集部について・掲載基準・お問い合わせ・店舗登録）。
 * 2026-10-23 オーナー決定「各業種 4 ページに収める」: フッターのナビゲーションはメニュー（ヘッダー）と同じ 4 つ。章の暖簾（麺・鮨・肉・酒・蕎）・地域の列・おまかせ提案・写真から探す・ショート動画は外した
 * （おまかせ提案・写真から探す・ショート動画の入口は「さがす」のページの中）。ページは消えていない。
 * top: トップの行き先（見本は NOREN_TOP、本番は /gourmet）。
 */
export default function NorenFooter({ top }: { top: string }) {
  const nav = menuWithTop(top);
  return (
    <footer className="vN-ft">
      <div className="vN-ft-rod" aria-hidden="true" />
      <div className="vN-ft-in">
        <div className="vN-ft-brand">
          <p className="vN-ft-logo">
            <span className="ja">マチノワ</span>
            {RELEASE_PERIPHERY ? <em data-ja="">グルメ</em> : <em>Gourmet</em>}
          </p>
          <p className="vN-ft-nlk">ニュースレター</p>
          <p className="vN-ft-nlh">
            マチノワで繋がる、<em>まだ見ぬ出会い</em>。
          </p>
          <p className="vN-ft-nls">知らない街と一軒との出会いを、編集部が毎週金曜にお届け。</p>
          <NorenNewsletter />
        </div>
        <div className="vN-ft-cols">
          <nav aria-label="ナビゲーション">
            <h2>ナビゲーション</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href + n.ja}>
                  <Link href={n.href}>{n.ja}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="vN-ft-b">
          <FootSmall className="vN-ft-sm" />
          <p className="vN-ft-c">
            <span>© 2026 マチノワ / 街の輪 · 無断転載禁止</span>
            <span>日本 全国 — 2026年</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
