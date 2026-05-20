import "@/app/admin/admin.css";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Store, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "店舗オーナーポータル — マチノワ",
  robots: { index: false, follow: false },
};

export default function OwnerPortal() {
  return (
    <div className="admin-root dark min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">MACHINOWA</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">店舗オーナーポータル</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            掲載店舗のオーナー様向けポータル。営業時間・写真・お知らせの更新申請をお受けします。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">準備中</CardTitle>
            <CardDescription>
              本ポータルは Day 22-23 で本格稼働予定です。現在は基礎フレームのみ。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Store className="size-4 text-muted-foreground" />
              <span>自店情報の確認・更新申請（実装中）</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <span>編集部とのメッセージのやり取り（実装中）</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-muted-foreground" />
              <span>申請の承認フロー（実装中）</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">現在の連絡先</CardTitle>
            <CardDescription>本ポータル稼働までは下記からご連絡ください</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              掲載情報の修正依頼・写真差し替え・新規掲載のご相談はマチノワ編集部までメールで受け付けています。
            </p>
            <Link
              href="mailto:linkateinc315@link8.info"
              className={buttonVariants({ variant: "outline" }) + " mt-3"}
            >
              <Mail className="size-4" /> linkateinc315@link8.info
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
