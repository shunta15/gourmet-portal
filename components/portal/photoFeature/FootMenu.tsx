import Link from "next/link";
import { menuWithTop } from "@/lib/portal/noren/nav";

/**
 * 写真が主役のページ（店ページ・特集記事・特集の一覧・シーン別まとめ記事）のフッターに置くナビゲーション。
 * 2026-10-23〜24 オーナー決定「各業種 4 ページに収める」: メニューと同じ 4 つ（トップ・さがす・店舗紹介・特集。lib/portal/noren/nav.ts の GOURMET_MENU）。
 * 暖簾のフッター（NorenFooter）・周りのページのフッター（periphery/parts.tsx）と同じ行き先。サーバー・クライアントのどちらからも使える。
 * top: トップの行き先（本番は /gourmet）。
 */
export default function FootMenu({ top }: { top: string }) {
  return (
    <nav className="pf-ft__menu" aria-label="ナビゲーション">
      <ul>
        {menuWithTop(top).map((n) => (
          <li key={n.ja}>
            <Link href={n.href}>{n.ja}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
