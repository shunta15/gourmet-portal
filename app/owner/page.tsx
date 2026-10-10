import "@/app/admin/admin.css";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Mail } from "lucide-react";

// フッターの「店舗登録」の行き先。訪問者向けに、準備中であることとお問い合わせへの案内だけを出す
export const metadata = {
  title: "店舗登録 — マチノワ",
  robots: { index: false, follow: false },
};

export default function OwnerPortal() {
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
