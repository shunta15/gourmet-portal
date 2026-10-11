import "./noren.css";
import Boot from "./Boot";
import NorenHeader from "./NorenHeader";
import NorenFooter from "./NorenFooter";
import { brush, latin } from "./fonts";
import { RELEASE_REST } from "@/lib/portal/noren/release";
import { BRIGHT_MUL, NOREN_REAL_BRIGHT, NOREN_REAL_DYE, NOREN_REAL_GROUND, NOREN_REAL_INNER } from "@/lib/portal/noren/realTop";
import "../noren-real/dye.css";
import "../noren-real/ground.css";

// CSS の布の明るさ（dye.css の「明るさ」）。リアル版が ON で、段階が 2 以上のときだけ、段階の割合を枠に渡す（1 のときは何も付けない＝今までと同じ）
const CLOTH_LIT = NOREN_REAL_INNER && BRIGHT_MUL[NOREN_REAL_BRIGHT] !== 1;
/** 段階 1 → 0%、段階 5 → 100%（倍率で線形に補間） */
const CLOTH_LIT_PCT = `${Math.round(((BRIGHT_MUL[NOREN_REAL_BRIGHT] - 1) / (BRIGHT_MUL[5] - 1)) * 1000) / 10}%`;

// 出現・暖簾の演出は、最初は隠した状態から始まる。スクリプトが動かない環境では、最初から全部見える（中身は全部そのまま読める）
const NOREN_NOSCRIPT_CSS =
  ".vN .vN-rv{opacity:1!important;transform:none!important}" +
  ".vS-hero{--open:1!important;--ex:1!important}" +
  ".vS-door{opacity:1!important}.vS-cover,.vS-cue,.vS-cloth,.vS-lan{display:none!important}" +
  ".vN-hd{background:rgba(var(--sumi-rgb,15,12,10),.94)!important}" +
  ".vF-stamp{opacity:.8!important;transform:rotate(-6deg)!important}" +
  ".vF-nr-fb{opacity:1!important}.vF-rodline{opacity:1!important}.vF-cloth,.vF-idx,.vF-prog{display:none!important}" +
  ".vH-door{--lift:1!important;--ex:1!important}";

/**
 * 暖簾の枠（紙・提灯・ヘッダー・フッター・<main>）。見本 /proto-noren と、公開スイッチ ON の本番 /gourmet が共通で使う。
 * 公開の判定（404 にするか）は呼び出し側のレイアウトが行う。ここは枠だけ。
 * top: トップの行き先（ロゴ・フッターの「トップ」と章への飛び先）。footExtra: フッターのナビゲーションに足すリンク（見本は無し）。
 */
export default function NorenFrame({
  top,
  footExtra,
  children,
}: {
  top: string;
  footExtra?: readonly { href: string; ja: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={`vN ${brush.variable} ${latin.variable}`} data-dye={NOREN_REAL_INNER ? NOREN_REAL_DYE : undefined} data-ground={RELEASE_REST && NOREN_REAL_GROUND !== "sumi" ? NOREN_REAL_GROUND : undefined} data-ground-top={NOREN_REAL_GROUND !== "sumi" ? NOREN_REAL_GROUND : undefined} data-rest={RELEASE_REST ? "1" : undefined} data-lit={CLOTH_LIT ? "1" : undefined} style={CLOTH_LIT ? ({ "--cloth-lit": CLOTH_LIT_PCT } as React.CSSProperties) : undefined}>
      <noscript>
        <style>{NOREN_NOSCRIPT_CSS}</style>
      </noscript>
      <Boot />
      <div className="vN-grain" aria-hidden="true" />
      <a className="vN-skip" href="#vN-main">本文へ移動</a>
      <NorenHeader top={top} />
      <main id="vN-main" tabIndex={-1}>{children}</main>
      <NorenFooter top={top} extraNav={footExtra} />
    </div>
  );
}
