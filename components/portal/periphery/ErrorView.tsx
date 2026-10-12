"use client";

/**
 * エラーのページ（app/error.tsx）の新しい見た目（クライアント。error.tsx は 'use client'）。字・ボタンの動き（もう一度試す = reset・ホームへ = /）は今の版と同じ。
 * 全ページの error 境界に入るので軽くしてある（動き Motion・動画・データは読まない。枠は PhotoFeatureShell と同じ .pf-root。上端の竿・フッターは静的）。
 */
// CSS の読み込み順: photofeature.css（PhotoFeatureShell）→ roundup.css → periphery.css
import PhotoFeatureShell from "../photoFeature/PhotoFeatureShell";
import "../photoFeature/roundup/roundup.css";
import "./periphery.css";
import { Footer, Header, Hero, Rod } from "./parts";

/** error: app/error.tsx が console.error 済み（ここでは使わない） */
export default function ErrorView({ reset }: { error?: Error & { digest?: string }; reset: () => void }) {
  return (
    <PhotoFeatureShell>
      <Header />
      <div id="main" className="rp-main pp-main">
        <Hero
          eyebrow="◎ エラー"
          title="読み込みに失敗しました。"
          lead={
            <>
              申し訳ございません。ページの読み込み中に予期しないエラーが発生しました。
              もう一度お試しいただくか、別のページからアクセスしてください。
            </>
          }
          compact
        h1Class="pp-hero-h1--msg"
          after={
            <div className="pp-acts">
              <button type="button" onClick={() => reset()} className="pf-btn">もう一度試す</button>
              <a href="/" className="pf-btn pf-btn--ghost">ホームへ</a>
            </div>
          }
        />
      </div>
      <Footer />
      <Rod />
    </PhotoFeatureShell>
  );
}
