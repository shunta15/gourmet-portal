import "./photofeature.css";
import EarlyJs from "./EarlyJs";
import { Defs } from "./parts";

/**
 * 写真が主役の特集記事の外枠（.pf-root）。見本 /proto-gourmet/photo-feature と、本来の URL（公開スイッチ ON の /feature/<id> の 20 本）が共通で使う。
 * 動きを入れる印を描画の前に付ける script（EarlyJs）、明朝の読み込み、SVG の部品（Defs）、「本文へ移動」を含む。
 * 公開の判定（404 にするか）・門・メタ情報は呼び出し側が行う。ここは枠だけ。
 */
export default function PhotoFeatureShell({ children, gate = true }: { children: React.ReactNode; gate?: boolean }) {
  return (
    <div className="pf-root" suppressHydrationWarning>
      <EarlyJs gate={gate} />
      {/* 太い明朝（ルートの読み込みは 500・700 だけなので、800 もここで読む。読めない環境では、手元の明朝に落ちる） */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;700;800&display=swap" precedence="default" />
      <Defs />
      <a className="pf-skip" href="#main">本文へ移動</a>
      {children}
    </div>
  );
}
