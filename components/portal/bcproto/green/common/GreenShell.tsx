import { jp, min, hand } from "./fonts";
import Header from "./Header";
import Footer from "./Footer";
import GreenFx from "./GreenFx";
import "./base.css";

/**
 * ボディケア案4(グリーン)の本番の枠(サーバー)。自前のヘッダー・フッターを持つので、共通のヘッダー・PortalFooter・PortalMotion は出さない
 * (総合トップの MachiShell prod と同じやり方)。共通の縦書きラベル・丸いカーソル・進み具合の線は base.css が隠す(body:has(.gr-root))。
 * 試作の noindex・「見本」の帯は出さない(それは app/proto-bodycare/green/layout.tsx だけ)。
 * 使う所: app/bodycare/(top|cp|shop|sub)/layout.tsx(lib/portal/vert/bodycareDesign.ts が "green" のとき。公開スイッチ OFF の 404 は呼ぶ側が assertPortalLive())。
 */
export default function GreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`gr-root ${jp.variable} ${min.variable} ${hand.variable}`}>
      <a className="gr-skip" href="#gr-main">
        本文へ移動
      </a>
      <div className="gr-progress" aria-hidden="true" />
      <div className="gr-edge gr-edge-l" aria-hidden="true">
        <i className="far" />
        <i className="near" />
      </div>
      <div className="gr-edge gr-edge-r" aria-hidden="true">
        <i className="far" />
        <i className="near" />
      </div>
      <Header />
      <main id="gr-main" className="gr-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <GreenFx />
    </div>
  );
}
