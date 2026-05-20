"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Loader2, FileWarning, CheckCircle2 } from "lucide-react";

export default function ImportRestaurantsPage() {
  const [csv, setCsv] = useState("");
  const [dryResult, setDryResult] = useState<any>(null);
  const [busy, setBusy] = useState<"check" | "import" | null>(null);
  const router = useRouter();

  async function call(dryRun: boolean) {
    if (!csv.trim()) return;
    setBusy(dryRun ? "check" : "import");
    try {
      const res = await fetch("/api/admin/import-restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, dryRun }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? "失敗");
        setDryResult(json);
        return;
      }
      if (dryRun) {
        setDryResult(json);
        toast.success(`検証 OK: ${json.ok}件取込可能 / 警告 ${json.issues?.length ?? 0}件`);
      } else {
        toast.success(`${json.upserted}件 取込完了`);
        router.push("/admin/restaurants?sort=updated");
      }
    } catch (e: any) {
      toast.error(`通信エラー: ${e?.message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setCsv(text);
    setDryResult(null);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/restaurants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 店舗一覧に戻る
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CSV 一括インポート</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          店舗 CSV をアップロード or 貼り付けて一括追加・更新します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">フォーマット</CardTitle>
          <CardDescription>
            最初の行はヘッダー。日本語カラム名で OK。エクスポートした CSV
            をそのまま編集して戻すのが推奨フロー
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1 font-mono">
          <div>ID, 店舗名, ジャンル, リージョン, エリア, 住所, 電話, 営業時間,</div>
          <div>定休日, 最寄り駅, 席数, 予算, 評価, 予約URL, 出典名, 出典URL,</div>
          <div>タグ, ハイライト, 短文説明, 公開中</div>
          <div className="pt-2 text-muted-foreground/70 font-sans">
            ※ タグ・ハイライトは「<code className="font-mono">|</code>」区切り
          </div>
          <div className="text-muted-foreground/70 font-sans">
            ※ ID が既存ならその店舗を更新、新規 ID なら追加
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV データ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input type="file" accept=".csv,text/csv" onChange={onPickFile} className="text-xs" />
          <Textarea
            value={csv}
            onChange={(e) => { setCsv(e.target.value); setDryResult(null); }}
            rows={12}
            placeholder="ID,店舗名,ジャンル,リージョン,..."
            className="font-mono text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => call(true)} disabled={busy !== null || !csv}>
              {busy === "check" ? <Loader2 className="size-4 animate-spin" /> : <FileWarning className="size-4" />}
              検証
            </Button>
            <Button type="button" onClick={() => call(false)} disabled={busy !== null || !csv}>
              {busy === "import" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              インポート実行
            </Button>
            {dryResult && dryResult.ok != null && (
              <span className="text-sm text-muted-foreground">
                取込可能 {dryResult.ok} 件 / 警告 {dryResult.issues?.length ?? 0} 件
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {dryResult?.issues?.length > 0 && (
        <Alert variant="destructive">
          <FileWarning className="size-4" />
          <AlertDescription>
            <div className="font-medium">警告 {dryResult.issues.length}件</div>
            <ul className="mt-1 text-xs space-y-0.5 max-h-48 overflow-y-auto">
              {dryResult.issues.slice(0, 30).map((i: any, idx: number) => (
                <li key={idx}>
                  L{i.line} / {i.id}: {i.msg}
                </li>
              ))}
              {dryResult.issues.length > 30 && <li>…他 {dryResult.issues.length - 30} 件</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {dryResult?.preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" /> プレビュー（先頭3件）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded bg-muted/40 p-3 text-xs">
              {JSON.stringify(dryResult.preview, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
