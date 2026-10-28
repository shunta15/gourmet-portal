import { assertPortalLive } from "@/lib/portal/launch";
import ContactLine from "@/components/portal/ContactLine";
import { jp, min, logo, lab } from "./top/fonts";
import "./top/a.css";

/**
 * スポーツの最初のページ・探すページの外枠(サーバー。見本2の「トップ」「探す」)。書体 4 つの変数をつける。公開スイッチ OFF のあいだは 404(ほかの新業種の外枠と同じ)。
 * 共通のポータルのヘッダー・フッターは出さない(ヘッダーは各ページの Header)。見本にフッターが無いので、フッターは付けない(アクティビティで「見本に無い」としてフッターのナビを外した 2026-10-24 の決定と同じ)。
 */
export default function TopFrame({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return (
    <div className={`s2-root ${jp.variable} ${min.variable} ${logo.variable} ${lab.variable}`}>
      {children}
      <ContactLine style={{ margin: 0, padding: "10px 14px 16px", textAlign: "center" }} />
    </div>
  );
}
