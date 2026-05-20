import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Upload } from "lucide-react";
import SelectableTable, { StatusBadge } from "@/components/admin/SelectableTable";

const REGIONS = [
  "tokyo", "osaka", "kyoto", "nagoya", "fukuoka", "hyogo",
  "kanagawa", "saitama", "nara", "hiroshima", "shiga",
  "gunma", "kagoshima", "wakayama", "hokkaido", "shizuoka",
];

export default async function AdminRestaurants({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const region = params.region ?? "";
  const sort = params.sort ?? "id";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const supabase = await createClient();

  let query = supabase
    .from("restaurants")
    .select("id, name, area, region, cuisine, published, updated_at", { count: "exact" });

  if (sort === "updated") query = query.order("updated_at", { ascending: false });
  else if (sort === "name") query = query.order("name");
  else query = query.order("id");

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
        <div className="flex items-center gap-2">
          <Link href="/admin/restaurants/import" className={buttonVariants({ variant: "outline" })}>
            <Upload className="size-4" /> CSV 取込
          </Link>
          <a
            href={`/api/admin/export-restaurants${region ? `?region=${region}` : ""}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Download className="size-4" /> CSV 出力
          </a>
          <Link href="/admin/restaurants/new" className={buttonVariants({ variant: "default" })}>
            <Plus className="size-4" /> 新規追加
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="店舗名で検索…" className="pl-9" />
        </div>
        <select
          name="region"
          defaultValue={region}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="">全エリア</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="id">ID 順</option>
          <option value="name">名前順</option>
          <option value="updated">最近編集順</option>
        </select>
        <Button type="submit" variant="secondary">絞り込み</Button>
        {(q || region) && (
          <Link href="/admin/restaurants" className={buttonVariants({ variant: "ghost" })}>
            リセット
          </Link>
        )}
      </form>

      <SelectableTable
        rows={(restaurants ?? []) as any[]}
        table="restaurants"
        editHref={(r) => `/admin/restaurants/${r.id}`}
        emptyMessage="該当する店舗がありません"
        columns={[
          {
            key: "id",
            label: "ID",
            className: "w-20",
            render: (r: any) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span>,
          },
          {
            key: "name",
            label: "店舗名",
            render: (r: any) => <span className="font-medium">{r.name}</span>,
          },
          {
            key: "area",
            label: "エリア",
            render: (r: any) => <span className="text-muted-foreground">{r.area}</span>,
          },
          {
            key: "cuisine",
            label: "ジャンル",
            render: (r: any) => <span className="text-muted-foreground">{r.cuisine}</span>,
          },
          {
            key: "published",
            label: "状態",
            className: "w-24",
            render: (r: any) => <StatusBadge published={r.published} />,
          },
        ]}
      />

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const usp = new URLSearchParams();
            if (q) usp.set("q", q);
            if (region) usp.set("region", region);
            if (sort) usp.set("sort", sort);
            usp.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/restaurants?${usp.toString()}`}
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
