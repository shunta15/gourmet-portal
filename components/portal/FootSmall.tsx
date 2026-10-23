import Link from "next/link";
import { FOOT_SMALL } from "@/lib/portal/noren/nav";

/**
 * グルメの全ページのフッターに置く、小さな文字の 1 行（マチノワ トップ・編集部について・掲載基準・お問い合わせ・店舗登録）。
 * 2026-10-23 オーナー決定「各業種 4 ページに収める」: メニュー（ヘッダーの「特集」「さがす」・フッターのナビゲーション）には数えない、サイトとして必要な小さな案内。
 * 見た目は、置く先のフッター（暖簾の NorenFooter・周りのページの Footer・写真が主役のページの FooterBar）が className で決める。
 * サーバー・クライアントのどちらからも使える。
 */
export default function FootSmall({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="サイト情報">
      <ul>
        {FOOT_SMALL.map((n) => (
          <li key={n.href}>
            <Link href={n.href}>{n.ja}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
