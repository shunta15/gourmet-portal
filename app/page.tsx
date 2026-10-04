import type { Metadata } from "next";
import GourmetHome from "@/components/portal/pages/gourmet-home";

/**
 * `/` はグルメのトップ（旧 `/` の中身。components/portal/pages/gourmet-home.tsx）。
 * metadata は旧 `/` と同一（canonical だけ。title・description・JSON-LD はルートレイアウトのもの）。
 *
 * 総合サイトの公開スイッチ（lib/portal/launch.ts）が ON のときは、next.config.ts の rewrites が `/` を
 * 総合トップ（app/portal-home）に差し替える。OFF のあいだは何も変わらない。
 * 総合トップをここに書かず別ルートにしているのは、総合トップの CSS（portal.css）・クライアント部品が、
 * OFF のときの `/` に混ざらないようにするため（同じページファイルに置くと、静的でも動的 import でも CSS が混ざる。
 * proto-portal/compare-off.mjs の stylesheet 検査で確認）。
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default GourmetHome;
