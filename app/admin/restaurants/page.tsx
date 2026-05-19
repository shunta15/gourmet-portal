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

const REGIONS = [
  "tokyo", "osaka", "kyoto", "nagoya", "fukuoka", "hyogo",
  "kanagawa", "saitama", "nara", "hiroshima", "shiga",
  "gunma", "kagoshima", "wakayama", "hokkaido", "shizuoka",
];

export default async function AdminRestaurants({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const region = params.region ?? "";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const supabase = await createClient();

  let query = supabase
    .from("restaurants")
    .select("id, name, area, region, cuisine, published", { count: "exact" })
    .order("id");

  if (q) query = query.ilike("name", `%${q}%`);
  if (region) query = query.eq("region", region);

  const { data: restaurants, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">店舗一覧</h1>
          <p className="mt-1 text-sm text-muted-foreground">{count ?? 0} 件</p>
        </div>
        <Link href="/admin/restaurants/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="size-4" /> 新規追加
        </Link>
      </div>

      {/* 検索フィルタ */}
      <form className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="店舗名で検索…"
            className="pl-9"
          />
        </div>
        <select
          name="region"
          defaultValue={region}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">全エリア</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary">絞り込み</Button>
        {(q || region) && (
          <Link href="/admin/restaurants" className={buttonVariants({ variant: "ghost" })}>
            リセット
          </Link>
        )}
      </form>

      {/* テーブル */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>店舗名</TableHead>
              <TableHead>エリア</TableHead>
              <TableHead>ジャンル</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.area}</TableCell>
                <TableCell className="text-muted-foreground">{r.cuisine}</TableCell>
                <TableCell>
                  <Badge variant={r.published ? "default" : "destructive"}>
                    {r.published ? "公開" : "非公開"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/restaurants/${r.id}`} className={buttonVariants({ variant: "link", size: "sm" })}>
                    編集
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(!restaurants || restaurants.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  該当する店舗がありません
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
            if (q) params.set("q", q);
            if (region) params.set("region", region);
            params.set("page", String(p));
            const href = `/admin/restaurants?${params.toString()}`;
            return (
              <Link
                key={p}
                href={href}
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
