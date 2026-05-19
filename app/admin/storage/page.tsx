import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Folder, Image as ImageIcon, ArrowLeft } from "lucide-react";

type StorageObject = {
  name: string;
  id: string | null;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
};

async function listObjects(supabase: any, bucket: string, prefix = "") {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });
  if (error) return [];
  return data as StorageObject[];
}

async function getBucketSize(supabase: any, bucket: string): Promise<{ count: number; bytes: number }> {
  // 単純合計（再帰的に取得）
  async function walk(prefix: string): Promise<StorageObject[]> {
    const items = await listObjects(supabase, bucket, prefix);
    const files: StorageObject[] = [];
    for (const item of items) {
      const isFolder = item.id === null;
      const next = prefix ? `${prefix}/${item.name}` : item.name;
      if (isFolder) {
        const sub = await walk(next);
        files.push(...sub);
      } else {
        files.push(item);
      }
    }
    return files;
  }
  const all = await walk("");
  const bytes = all.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);
  return { count: all.length, bytes };
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default async function StorageBrowser({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string; path?: string }>;
}) {
  const params = await searchParams;
  const bucket = params.bucket ?? "restaurants";
  const path = params.path ?? "";

  const supabase = await createClient();

  const items = await listObjects(supabase, bucket, path);
  const folders = items.filter((i) => i.id === null);
  const files = items.filter((i) => i.id !== null);

  // バケット容量
  const [restaurantsSize, featuresSize] = await Promise.all([
    getBucketSize(supabase, "restaurants"),
    getBucketSize(supabase, "features"),
  ]);

  const parts = path.split("/").filter(Boolean);
  function getPublicUrl(fileName: string): string {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    return supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">画像ライブラリ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Supabase Storage の画像を閲覧</p>
        </div>
      </div>

      {/* バケット選択 + 容量 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { id: "restaurants", label: "店舗 (restaurants)", stat: restaurantsSize },
          { id: "features", label: "特集記事 (features)", stat: featuresSize },
        ].map((b) => (
          <Link
            key={b.id}
            href={`/admin/storage?bucket=${b.id}`}
            className={`block rounded-md border p-4 transition-colors ${
              bucket === b.id ? "border-primary bg-accent/20" : "border-input hover:bg-accent/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{b.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {b.stat.count} files / {formatBytes(b.stat.bytes)}
                </div>
              </div>
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      {/* パンくず */}
      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {path && (
          <Link
            href={`/admin/storage?bucket=${bucket}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> 戻る
          </Link>
        )}
        <span className="font-mono text-xs">
          {bucket}/
          {parts.map((p, i) => {
            const sub = parts.slice(0, i + 1).join("/");
            return (
              <span key={i}>
                <Link
                  href={`/admin/storage?bucket=${bucket}&path=${sub}`}
                  className="hover:text-foreground"
                >
                  {p}
                </Link>
                {i < parts.length - 1 && "/"}
              </span>
            );
          })}
        </span>
      </div>

      {/* フォルダ */}
      {folders.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">フォルダ ({folders.length})</div>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
            {folders.map((f) => (
              <Link
                key={f.name}
                href={`/admin/storage?bucket=${bucket}&path=${path ? `${path}/${f.name}` : f.name}`}
                className="flex items-center gap-2 rounded-md border border-input p-3 text-sm hover:bg-accent/30"
              >
                <Folder className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ファイル */}
      {files.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">ファイル ({files.length})</div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {files.map((f) => {
              const url = getPublicUrl(f.name);
              const size = f.metadata?.size ?? 0;
              return (
                <a
                  key={f.name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-md border border-input bg-muted/20 transition-colors hover:border-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={f.name}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="p-2">
                    <div className="line-clamp-1 text-[10px] font-mono text-muted-foreground" title={f.name}>
                      {f.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{formatBytes(size)}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {files.length === 0 && folders.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            このディレクトリには画像がありません。<br />
            店舗・特集記事の編集画面からアップロードしてください。
          </p>
        </Card>
      )}
    </div>
  );
}
