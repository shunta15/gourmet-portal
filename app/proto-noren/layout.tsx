import "./noren.css";
import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import Boot from "@/components/portal/noren/Boot";
import NorenHeader from "@/components/portal/noren/NorenHeader";
import NorenFooter from "@/components/portal/noren/NorenFooter";
import { brush, latin } from "./fonts";

// 暖簾のデザインの見本（トップ・店ページ・特集記事ページ）。プレビュー・ローカル専用。
// 404 になる条件: 公開スイッチ OFF（next.config.ts の PORTAL_OFF_SOURCES と、ここ）、または プレビュー・ローカルでない（本番は ON でも 404）。
export const metadata: Metadata = { robots: { index: false, follow: false } };

const NOSCRIPT_CSS =
  ".vN .vN-rv{opacity:1!important;transform:none!important}" +
  ".vS-hero{--open:1!important;--ex:1!important}" +
  ".vS-door{opacity:1!important}.vS-cover,.vS-cue,.vS-cloth,.vS-lan{display:none!important}" +
  ".vN-hd{background:rgba(15,12,10,.94)!important}" +
  ".vF-cap{clip-path:none!important}.vF-roller{display:none!important}.vF-stamp{opacity:.8!important;transform:rotate(-6deg)!important}";

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className={`vN ${brush.variable} ${latin.variable}`}>
      {/* 出現・暖簾の演出は、最初は隠した状態から始まる。スクリプトが動かない環境では、最初から全部見える（中身は全部そのまま読める） */}
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      <Boot />
      <div className="vN-grain" aria-hidden="true" />
      <a className="vN-skip" href="#vN-main">本文へ移動</a>
      <NorenHeader />
      <main id="vN-main" tabIndex={-1}>{children}</main>
      <NorenFooter />
    </div>
  );
}
