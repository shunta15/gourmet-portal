"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

const MODES = [
  { id: "tone-editorial", label: "編集トーン準拠で書き直し" },
  { id: "shorter", label: "短く（30〜40%圧縮）" },
  { id: "expand", label: "詳しく（編集部視点で展開）" },
  { id: "casual", label: "口語的に（あるある調）" },
  { id: "formal", label: "丁寧めに統一" },
];

export default function AIRewriteButton({
  text,
  onResult,
  context,
}: {
  text: string;
  onResult: (newText: string) => void;
  context?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function call(mode: string) {
    if (!text.trim()) {
      toast.error("テキストが空です");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, context }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? "失敗");
        return;
      }
      onResult(json.text);
      toast.success(`AI で「${MODES.find((m) => m.id === mode)?.label}」しました`);
    } catch (e: any) {
      toast.error(`通信エラー: ${e?.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button type="button" variant="ghost" size="xs" disabled={busy} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
          {busy ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          AI リライト
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MODES.map((m) => (
          <DropdownMenuItem key={m.id} onClick={() => call(m.id)} disabled={busy}>
            {m.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
