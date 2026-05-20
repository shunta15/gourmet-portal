"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

type DraftResult = {
  name?: string;
  cuisine?: string;
  area?: string;
  region?: string;
  address?: string;
  hours?: string;
  closed?: string;
  seats?: string;
  nearest?: string;
  phone?: string;
  budget?: string;
  rating?: string;
  desc?: string;
  highlights?: string[];
  tags?: string[];
  source_label?: string;
  source_url?: string;
};

export default function AIDraftButton({
  onResult,
}: {
  onResult: (data: DraftResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/draft-restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? "AI 下書き生成に失敗しました");
        return;
      }
      onResult(json.data ?? {});
      toast.success("AI 下書きを反映しました");
      setOpen(false);
      setUrl("");
    } catch (e: any) {
      toast.error(`通信エラー: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="size-3.5" /> AI 下書き
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>URL から AI 下書きを生成</DialogTitle>
          <DialogDescription>
            食べログ・ぐるなび・公式サイトなどの URL を貼ってください。Claude が
            ページを読み解いて、店舗情報をフォームに自動入力します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="draft-url">URL</Label>
          <Input
            id="draft-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tabelog.com/... または https://店舗公式 ..."
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            ※ ANTHROPIC_API_KEY が Vercel 環境変数に設定されている必要があります
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleGenerate} disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> 生成中…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> 生成して反映
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
