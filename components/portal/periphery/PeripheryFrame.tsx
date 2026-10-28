// CSS の読み込み順: photofeature.css（PhotoFeatureShell）→ roundup.css → periphery.css（後のものが同じ強さの規則に勝つ）
import PhotoFeatureShell from "../photoFeature/PhotoFeatureShell";
import "../photoFeature/roundup/roundup.css";
import "./periphery.css";
import Motion from "../photoFeature/Motion";
import { Footer, Header, Rod } from "./parts";
import NavPending from "./NavPending";

/**
 * 周りのページ（動画・見つからない・エラーなど）の共通の枠。特集の一覧 /feature と同じ世界:
 * 和紙の地（.pf-root）・上端の竿の帯（グルメ・特集・さがす）・ヘッダー・フッター・筆の線・朱の印・小さな暖簾の見出し。入口の大きな暖簾（WebGL）は掛けない。
 * 各ページは、この中に中身（Hero・Sec など）を置く。公開の判定（404 にするか）・メタ情報・構造化データは呼び出し側が行う（ここは枠だけ）。
 * グルメの共通の枠（旧ヘッダー・横のラベル・進み線・カーソル）は、photofeature.css の body:has(.pf-root) が隠す（isPortalPath は変えない）。
 * <main> は外側（SiteShell・動画のレイアウト）が持つ。ここは #main の div。
 */
export default function PeripheryFrame({ children }: { children: React.ReactNode }) {
  return (
    <PhotoFeatureShell>
      <Header />
      <div id="main" className="rp-main pp-main">
        {children}
      </div>
      <Footer />
      <Rod />
      <Motion />
      <NavPending />
    </PhotoFeatureShell>
  );
}
