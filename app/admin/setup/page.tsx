import * as fs from "fs";
import * as path from "path";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isExtSchemaApplied } from "@/lib/db/schema-check";
import SetupClient from "@/components/admin/SetupClient";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

function readMigration(file: string): string {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), "supabase", "migrations", file),
      "utf-8"
    );
  } catch {
    return "";
  }
}

export default async function SetupPage() {
  const applied = await isExtSchemaApplied();
  const sql0002 = readMigration("0002_cms_extensions.sql");
  const sql0003 = readMigration("0003_storage_policies.sql");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">セットアップ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CMS の追加機能を有効化するためのチェックリスト
        </p>
      </div>

      {/* Schema 適用ステータス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {applied ? (
              <>
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span>拡張スキーマ（0002 / 0003）</span>
                <Badge variant="default" className="ml-auto">適用済み</Badge>
              </>
            ) : (
              <>
                <XCircle className="size-5 text-rose-500" />
                <span>拡張スキーマ（0002 / 0003）</span>
                <Badge variant="destructive" className="ml-auto">未適用</Badge>
              </>
            )}
          </CardTitle>
          <CardDescription>
            これを適用すると、status / publish_at / リビジョン / 監査ログ /
            画像 RLS / 予約リンク / クーポン / オーナー申請の各機能が解禁されます。
          </CardDescription>
        </CardHeader>
        {!applied && (
          <CardContent>
            <SetupClient sql0002={sql0002} sql0003={sql0003} />
          </CardContent>
        )}
      </Card>

      {/* AI 環境変数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 下書き生成（ANTHROPIC_API_KEY）</CardTitle>
          <CardDescription>
            Vercel の環境変数に <code className="font-mono text-xs">ANTHROPIC_API_KEY</code>{" "}
            を追加すると、AI 下書き / AI 校閲が動きます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            Vercel ダッシュボードを開く <ExternalLink className="size-3.5" />
          </a>
        </CardContent>
      </Card>

      {/* GA4 / Search Console */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">分析ダッシュボード（GA4 / Search Console）</CardTitle>
          <CardDescription>
            実装プランは <code className="font-mono text-xs">agent-teams/work/analyst_dashboard_plan_2026-05-20.md</code>{" "}
            に記載済み。Service Account + OAuth で接続します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vercel Analytics は既に有効。GA4 + Search Console は Day 18 で接続予定。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
