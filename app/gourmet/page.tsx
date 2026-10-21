import type { Metadata } from "next";
import GourmetNorenHomeReal from "@/components/portal/noren-real/GourmetNorenHomeReal";
import { assertPortalLive } from "@/lib/portal/launch";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { NOREN_REAL_DYE } from "@/lib/portal/noren/realTop";
import { resolveOpen } from "@/lib/portal/noren/looks";

// グルメのトップ（公開スイッチ ON のときだけ。2026-10-09 から暖簾のデザイン。枠は app/gourmet/layout.tsx）。
// 中身は components/portal/noren-real/GourmetNorenHomeReal.tsx（リアル版の暖簾）。
// 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）。
// ON のあいだだけの URL なので、canonical は自分自身の /gourmet。title・description は旧 /gourmet と同じ。
export const metadata: Metadata = {
  title: "グルメの店をエリア・特集・シーンから探す｜マチノワグルメ",
  description:
    "全国の街のいいお店を、エリア・業態・特集・利用シーンから巡れるグルメのポータル「マチノワグルメ」。",
  alternates: { canonical: "/gourmet" },
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  assertPortalLive();
  // 最初の画面はリアル版の暖簾。色は固定で、URL では替わらない
  // スマホ幅の暖簾の丈の案は URL の ?sp=、見出し・リードの候補は ?copy=1〜5 で替えられる（見比べ用）。本番（VERCEL_ENV が production）では URL の指定を無視する（サーバーで判定して渡す）
  const allowUrl = process.env.VERCEL_ENV !== "production";
  const sp = allowUrl ? await searchParams : {};
  const one = (v: string | string[] | undefined) => (([] as string[]).concat(v ?? [])[0] ?? "");
  // 「店を、さがす。」の色（block のとき）: ?open=dark（既定。暖簾の灰墨）|block（白と橙）、?tiles=1（業種のタイル）、?band=e|g（帯の地図）。見本でだけ効く
  const open = resolveOpen({ open: one(sp.open), tiles: one(sp.tiles), band: one(sp.band), box: one(sp.box) }, allowUrl);
  return <GourmetNorenHomeReal links={LIVE_LINKS} dye={NOREN_REAL_DYE} allowSpUrl={allowUrl} allowCopyUrl={allowUrl} searchOpen={open} />;
}
