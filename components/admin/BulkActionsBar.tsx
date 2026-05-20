"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Trash2, Loader2, X } from "lucide-react";

type Props = {
  table: "restaurants" | "feature_articles";
  selectedIds: string[];
  onClear: () => void;
};

export default function BulkActionsBar({ table, selectedIds, onClear }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  async function setPublished(value: boolean) {
    setBusy(value ? "publish" : "unpublish");
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      .update({ published: value })
      .in("id", selectedIds);
    setBusy(null);
    if (error) {
      toast.error(`一括${value ? "公開" : "非公開"}失敗: ${error.message}`);
      return;
    }
    toast.success(`${selectedIds.length}件を${value ? "公開" : "非公開"}にしました`);
    onClear();
    router.refresh();
  }

  async function deleteAll() {
    setBusy("delete");
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().in("id", selectedIds);
    setBusy(null);
    if (error) {
      toast.error(`一括削除失敗: ${error.message}`);
      return;
    }
    toast.success(`${selectedIds.length}件を削除しました`);
    onClear();
    router.refresh();
  }

  return (
    <div className="sticky top-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-popover px-4 py-3 shadow-lg">
      <Button type="button" variant="ghost" size="icon-sm" onClick={onClear} title="選択解除">
        <X className="size-3.5" />
      </Button>
      <span className="text-sm">
        <span className="font-semibold">{selectedIds.length}件</span> 選択中
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPublished(true)}
          disabled={busy !== null}
        >
          {busy === "publish" ? <Loader2 className="size-3.5 animate-spin" /> : <Eye className="size-3.5" />}
          公開
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPublished(false)}
          disabled={busy !== null}
        >
          {busy === "unpublish" ? <Loader2 className="size-3.5 animate-spin" /> : <EyeOff className="size-3.5" />}
          非公開
        </Button>
        <Dialog>
          <DialogTrigger>
            <Button type="button" variant="destructive" size="sm" disabled={busy !== null}>
              <Trash2 className="size-3.5" /> 削除
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIds.length} 件を削除しますか？</DialogTitle>
              <DialogDescription>
                この操作は取り消せません。本当に全件削除する場合のみ続行してください。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteAll}
                disabled={busy !== null}
              >
                {busy === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                完全に削除する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
