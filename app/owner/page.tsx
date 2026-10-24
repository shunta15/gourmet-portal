import "@/app/admin/admin.css";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { RELEASE_PERIPHERY, RELEASE_REST } from "@/lib/portal/noren/release";
import dynamic from "next/dynamic";
import { isPortalLive } from "@/lib/portal/launch";
import OwnerPortalLegacy, { legacyMetadata } from "./OwnerPortalLegacy";
// 新しい見た目の部品は、描画するとき（RELEASE_PERIPHERY が true）だけ読み込む（false のとき JS は読まない。CSS はこのページの入口にだけ載り、ほかのページには載らない）
const OwnerView = dynamic(() => import("@/components/portal/periphery/OwnerView"));

// 総合サイトの共通の枠で出す版（公開スイッチ ON のとき。業種に寄らない共通ページ。components/portal/pages/common-pages.tsx）
const CommonOwner = dynamic(() => import("@/components/portal/pages/common-pages").then((m) => m.CommonOwner));

// フッターの「店舗登録」の行き先。訪問者向けに、準備中であることとお問い合わせへの案内だけを出す
// RELEASE_REST が false のあいだは、今の本番の店舗登録ページ（OwnerPortalLegacy）を出す
export const metadata = RELEASE_REST
  ? {
      title: "店舗登録 — マチノワ",
      robots: { index: false, follow: false },
    }
  : legacyMetadata;

export default function OwnerPortal() {
  if (isPortalLive()) return <CommonOwner rest={RELEASE_REST} />;
  // 周りのページの新しい見た目（RELEASE_PERIPHERY。/feature と同じ世界）。字・リンク先は同じ（RELEASE_REST の版ごと）
  if (RELEASE_PERIPHERY) return <OwnerView rest={RELEASE_REST} />;
  if (!RELEASE_REST) return <OwnerPortalLegacy />;
  return (
    <div className="admin-root min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">MACHINOWA</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">店舗登録</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">準備中</CardTitle>
            <CardDescription>店舗の登録は、準備中です。</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              掲載についてのご相談は、お問い合わせからお寄せください。
            </p>
            <Link href="/contact" className={buttonVariants({ variant: "outline" }) + " mt-3"}>
              <Mail className="size-4" /> お問い合わせ
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
