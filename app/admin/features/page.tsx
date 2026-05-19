import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "active" | "published" | "drafts" | "legacy" | "all";

const FILTER_LABEL: Record<Filter, string> = {
  active: "実稼働",
  published: "公開のみ",
  drafts: "下書き",
  legacy: "旧 legacy",
  all: "全件",
};

function isLegacyId(id: string): boolean {
  return id.startsWith("feature-");
}

export default async function AdminFeatures({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: Filter }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const filter: Filter = (params.filter as Filter) ?? "active";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const supabase = await createClient();

  const { data: idIndex } = await supabase
    .from("feature_articles")
    .select("id, published")
    .limit(10000);

  const ids = idIndex ?? [];
  const counts = {
    all: ids.length,
    published: ids.filter((x: any) => x.published).length,
    drafts: ids.filter((x: any) => !x.published && !isLegacyId(x.id)).length,
    legacy: ids.filter((x: any) => isLegacyId(x.id)).length,
    active: ids.filter((x: any) => !isLegacyId(x.id)).length,
  };

  let allowedIds: string[] | null = null;
  if (filter === "active") {
    allowedIds = ids.filter((x: any) => !isLegacyId(x.id)).map((x: any) => x.id);
  } else if (filter === "published") {
    allowedIds = ids.filter((x: any) => x.published).map((x: any) => x.id);
  } else if (filter === "drafts") {
    allowedIds = ids.filter((x: any) => !x.published && !isLegacyId(x.id)).map((x: any) => x.id);
  } else if (filter === "legacy") {
    allowedIds = ids.filter((x: any) => isLegacyId(x.id)).map((x: any) => x.id);
  }

  let query = supabase
    .from("feature_articles")
    .select("id, no, title, kicker, date, published", { count: "exact" })
    .order("no");

  if (allowedIds !== null) {
    if (allowedIds.length === 0) {
      query = query.in("id", ["__empty_sentinel__"]);
    } else {
      query = query.in("id", allowedIds);
    }
  }
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: articles, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">特集記事</h1>
          <p className="mt-1 text-sm text-muted-foreground">{count ?? 0} 件表示中</p>
        </div>
        <Link href="/admin/features/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="size-4" /> 新規追加
        </Link>
      </div>

      {/* サマリ */}
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">公開</span>
            <span className="font-semibold">{counts.published}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-rose-500" />
            <span className="text-muted-foreground">下書き</span>
            <span className="font-semibold">{counts.drafts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">legacy</span>
            <span className="font-semibold">{counts.legacy}</span>
          </div>
          <div className="ml-auto text-muted-foreground">
            合計 <span className="font-semibold text-foreground">{counts.all}</span>
          </div>
        </div>
      </Card>

      {/* フィルタタブ */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABEL) as Filter[]).map((k) => {
          const active = filter === k;
          const params = new URLSearchParams();
          params.set("filter", k);
          if (q) params.set("q", q);
          return (
            <Link
              key={k}
              href={`/admin/features?${params.toString()}`}
              className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }), active && "shadow-sm")}
            >
              {FILTER_LABEL[k]}
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">
                {counts[k]}
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* 検索 */}
      <form className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="filter" value={filter} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="タイトルで検索…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">検索</Button>
      </form>

      {/* テーブル */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>キッカー</TableHead>
              <TableHead className="w-28">日付</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.map((a) => {
              const legacy = isLegacyId(a.id);
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.no || "—"}</TableCell>
                  <TableCell className="font-medium">
                    <span className="line-clamp-1">{a.title}</span>
                    {legacy && (
                      <Badge variant="outline" className="ml-2 text-[10px] text-yellow-500 border-yellow-500/40">
                        LEGACY
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{a.kicker}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{a.date}</TableCell>
                  <TableCell>
                    <Badge variant={a.published ? "default" : "destructive"}>
                      {a.published ? "公開" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/features/${a.id}`} className={buttonVariants({ variant: "link", size: "sm" })}>
                      編集
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!articles || articles.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  該当する記事がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            params.set("filter", filter);
            if (q) params.set("q", q);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/features?${params.toString()}`}
                className={buttonVariants({ variant: p === page ? "default" : "outline", size: "sm" }) + " size-9 p-0"}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
