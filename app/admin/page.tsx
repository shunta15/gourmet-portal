import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Store, Newspaper, Plus, ArrowRight, FileText, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: restaurantCount },
    { count: featureCount },
    { count: publishedFeatures },
    { count: draftFeatures },
  ] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }).eq("published", false),
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
          <Link href="/admin/features?filter=drafts" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            ドラフト一覧 <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>

      {/* CMS 状態ノート */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CMS 構築の進捗</CardTitle>
          <CardDescription>4週間ロードマップに沿って実装中</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            <span>Day 1: Supabase 基盤・shadcn 導入・スキーマ拡張 SQL 準備</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            <span>Day 2: 管理画面の shadcn 化（このページから着手）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-muted" />
            <span className="text-muted-foreground">Day 3: 店舗 CRUD フォーム強化・画像アップロード</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
