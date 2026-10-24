import "@/components/portal/portal.css";
import PortalLayout from "../PortalLayout";

/**
 * 業種に寄らないサイト共通ページ（編集部について /about・掲載基準 /editorial/guidelines・お問い合わせ /contact・店舗登録 /owner）の枠。
 * /videos・/station・/map と同じ総合サイトの共通の枠（PortalLayout＝業種の切り替えと検索のあるヘッダー・総合フッター）。2026-10-24 オーナー決定。
 * 各 app/{about,contact,owner,editorial}/layout.tsx が、公開スイッチ ON のときだけ next/dynamic でこれを読み込む
 * （OFF のあいだは従来のまま。portal.css とヘッダーの JS は、OFF のあいだ読み込まれない）。
 */
export default function CommonShell({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
