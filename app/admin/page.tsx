import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Newspaper,
  Plus,
  ArrowRight,
  FileText,
  Eye,
  EyeOff,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: restaurantCount },
    { count: featureCount },
    { count: publishedFeatures },
    { count: draftFeatures },
    { data: recentRestaurants },
    { data: recentFeatures },
  ] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }).eq("published", false),
    supabase
      .from("restaurants")
      .select("id, name, region, updated_at, published")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("feature_articles")
      .select("id, title, updated_at, published")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    {
      label: "掲載店舗",
      value: restaurantCount ?? 0,
      href: "/admin/restaurants",
      icon: Store,
      hint: "店舗一覧を見る",
    },
    {
      label: "特集記事 (合計)",
      value: featureCount ?? 0,
      href: "/admin/features",
      icon: Newspaper,
      hint: "全件を見る",
    },
    {
      label: "公開中の特集",
      value: publishedFeatures ?? 0,
      href: "/admin/features?filter=published",
      icon: Eye,
      hint: "公開のみ",
    },
    {
      label: "ドラフト",
      value: draftFeatures ?? 0,
      href: "/admin/features?filter=drafts",
      icon: EyeOff,
      hint: "下書きを見る",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">マチノワ CMS の運用状況</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="block">
              <Card className="transition-colors hover:bg-accent/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{s.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint} →</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">クイックアクション</CardTitle>
          <CardDescription>よく使う操作へのショートカット</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/restaurants/new" className={buttonVariants({ variant: "default", size: "lg" })}>
            <Plus className="size-4" /> 店舗を追加
          </Link>
          <Link href="/admin/features/new" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <FileText className="size-4" /> 特集記事を追加
          </Link>
          <Link href="/admin/storage" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <ImageIcon className="size-4" /> 画像ライブラリ
          </Link>
          <Link href="/admin/features?filter=drafts" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            ドラフト一覧 <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Recent edits */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              最近編集された店舗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {(recentRestaurants ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">編集履歴がありません</p>
            ) : (
              (recentRestaurants ?? []).map((r: any) => (
                <Link
                  key={r.id}
                  href={`/admin/restaurants/${r.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{r.id}</span>
                      <span className="line-clamp-1">{r.name}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{r.region} · {formatTimeAgo(r.updated_at)}</div>
                  </div>
                  <Badge variant={r.published ? "default" : "destructive"} className="shrink-0 text-[10px]">
                    {r.published ? "公開" : "非公開"}
                  </Badge>
                </Link>
              ))
            )}
            <Link
              href="/admin/restaurants?sort=updated"
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              全て見る <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              最近編集された特集記事
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {(recentFeatures ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">編集履歴がありません</p>
            ) : (
              (recentFeatures ?? []).map((a: any) => (
                <Link
                  key={a.id}
                  href={`/admin/features/${a.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-1">{a.title}</span>
                    <div className="mt-0.5 text-xs text-muted-foreground">{formatTimeAgo(a.updated_at)}</div>
                  </div>
                  <Badge variant={a.published ? "default" : "destructive"} className="shrink-0 text-[10px]">
                    {a.published ? "公開" : "非公開"}
                  </Badge>
                </Link>
              ))
            )}
            <Link
              href="/admin/features?sort=updated"
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              全て見る <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* CMS 状態ノート */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CMS 構築の進捗</CardTitle>
          <CardDescription>4週間ロードマップに沿って実装中</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ProgressRow done label="Day 1: Supabase 基盤・shadcn 導入・スキーマ拡張 SQL 準備" />
          <ProgressRow done label="Day 2: 管理画面の shadcn 化" />
          <ProgressRow done label="Day 3: 店舗・特集 CRUD + 画像アップロード + Storage バケット" />
          <ProgressRow done label="Day 4: 最近の編集 / 画像ライブラリ / 並び順" />
          <ProgressRow label="Day 5: status / publish_at / リビジョン (0002 SQL 適用待ち)" />
          <ProgressRow label="Day 6: 公開ページの DB 駆動化" />
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressRow({ done, label }: { done?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block size-2 rounded-full ${done ? "bg-emerald-500" : "bg-muted"}`} />
      <span className={done ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}日前`;
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}
