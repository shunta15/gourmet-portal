/**
 * COLOR PLAY(本番)の外枠(サーバー)。見本(app/proto-beauty/colorplay/layout.tsx)と同じ CSS・書体・スクロール連動を使う。
 * 公開スイッチ OFF のあいだは 404(lib/portal/launch.ts)。ヘッダー・フッター・<main> は各ページが出す
 * (トップだけ、ヘッダーが赤い面の上に重なるため)。
 */
import { assertPortalLive } from "@/lib/portal/launch";
import { cond, jp, latin, script } from "@/components/portal/bproto/colorplay/fonts";
import ScrollFx from "@/components/portal/bproto/colorplay/ScrollFx";
import "@/components/portal/bproto/colorplay/colorplay.css";
import "./site.css";
import type { CpSite } from "@/lib/portal/colorplay/site";

export default function CpFrame({ site, children }: { site: CpSite; children: React.ReactNode }) {
  assertPortalLive();
  return (
    <div className={`cp-root cp-th-${site.theme} ${jp.variable} ${cond.variable} ${script.variable} ${latin.variable}`}>
      <a className="cp-skip" href="#cp-main">本文へ移動</a>
      <ScrollFx />
      {children}
    </div>
  );
}
