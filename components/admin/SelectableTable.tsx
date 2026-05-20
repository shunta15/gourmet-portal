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

type Column<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T extends { id: string; published: boolean }> = {
  rows: T[];
  columns: Column<T>[];
  editHref: (row: T) => string;
  table: "restaurants" | "feature_articles";
  emptyMessage?: string;
};

export default function SelectableTable<T extends { id: string; published: boolean }>({
  rows,
  columns,
  editHref,
  table,
  emptyMessage = "該当する項目がありません",
}: Props<T>) {
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

  return (
    <div className="space-y-3">
      <BulkActionsBar
        table={table}
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
              {columns.map((c) => (
                <TableHead key={String(c.key)} className={c.className}>
                  {c.label}
                </TableHead>
              ))}
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isSel = selected.has(row.id);
                return (
                  <TableRow key={row.id} data-state={isSel ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggle(row.id)}
                        aria-label={`select ${row.id}`}
                      />
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell key={String(c.key)} className={c.className}>
                        {c.render ? c.render(row) : (row as any)[c.key]}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Link href={editHref(row)} className={buttonVariants({ variant: "link", size: "sm" })}>
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
