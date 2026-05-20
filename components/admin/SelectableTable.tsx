"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BulkActionsBar from "./BulkActionsBar";

type Kind = "restaurants" | "feature_articles";

type Row = {
  id: string;
  published: boolean;
  // restaurants
  name?: string;
  area?: string;
  region?: string;
  cuisine?: string;
  // features
  no?: string;
  title?: string;
  kicker?: string;
  date?: string;
};

function isLegacyId(id: string): boolean {
  return id.startsWith("feature-");
}

export default function SelectableTable({
  rows,
  kind,
  emptyMessage = "該当する項目がありません",
}: {
  rows: Row[];
  kind: Kind;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }
  const allChecked = rows.length > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && selected.size < rows.length;

  const isRestaurants = kind === "restaurants";

  return (
    <div className="space-y-3">
      <BulkActionsBar
        table={kind}
        selectedIds={[...selected]}
        onClear={() => setSelected(new Set())}
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked || someChecked}
                  onCheckedChange={toggleAll}
                  aria-label="全選択"
                />
              </TableHead>
              {isRestaurants ? (
                <>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>店舗名</TableHead>
                  <TableHead>エリア</TableHead>
                  <TableHead>ジャンル</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="w-20">No</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>キッカー</TableHead>
                  <TableHead className="w-28">日付</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                </>
              )}
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isSel = selected.has(row.id);
                const href = isRestaurants
                  ? `/admin/restaurants/${row.id}`
                  : `/admin/features/${row.id}`;
                return (
                  <TableRow key={row.id} data-state={isSel ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggle(row.id)}
                        aria-label={`select ${row.id}`}
                      />
                    </TableCell>
                    {isRestaurants ? (
                      <>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.area}</TableCell>
                        <TableCell className="text-muted-foreground">{row.cuisine}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.no || "—"}</TableCell>
                        <TableCell className="font-medium">
                          <span className="line-clamp-1">{row.title}</span>
                          {isLegacyId(row.id) && (
                            <Badge variant="outline" className="ml-2 text-[10px] text-yellow-500 border-yellow-500/40">
                              LEGACY
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{row.kicker}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{row.date}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Badge variant={row.published ? "default" : "destructive"}>
                        {row.published ? "公開" : "非公開"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={href} className={buttonVariants({ variant: "link", size: "sm" })}>
                        編集
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return <Badge variant={published ? "default" : "destructive"}>{published ? "公開" : "非公開"}</Badge>;
}
