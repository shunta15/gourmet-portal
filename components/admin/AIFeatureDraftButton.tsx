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
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Copy, CheckCircle2 } from "lucide-react";

type Result = {
  title?: string;
  titleHTML?: string;
  subtitle?: string;
  kicker?: string;
  lede?: string;
  points?: Array<{
    name: string;
    purpose: string;
    cuisine?: string;
    area?: string;
    desc: string;
    specs: { k: string; v: string }[];
  }>;
  quote?: string;
  closing?: string;
};

export default function AIFeatureDraftButton({
  onResult,
}: {
  onResult: (data: Result) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [axis, setAxis] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/draft-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), axis: axis.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? "失敗");
        return;
      }
      const data: Result = json.data;
      setResult(data);
      // DB に書ける項目だけフォームへ
      onResult({
        title: data.title,
        titleHTML: data.titleHTML,
        subtitle: data.subtitle,
        kicker: data.kicker,
        lede: data.lede,
      });
      toast.success("AI ドラフト生成完了。POINT・quote・closing は下にコピペ用テキストで表示しました");
    } catch (e: any) {
      toast.error(`通信エラー: ${e?.message}`);
    } finally {
      setLoading(false);
    }
  }

  function buildCopyText(): string {
    if (!result) return "";
    const lines: string[] = [];
    if (result.points?.length) {
      lines.push("=== POINT セクション（data.ts に貼付） ===");
      result.points.forEach((p, i) => {
        const n = i + 1;
        const specs = (p.specs ?? []).map((s) => `{ k: "${s.k}", v: "${s.v}" }`).join(", ");
        lines.push(`p(${n}, "${p.name}", "${p.cuisine ?? ""}", "${p.area ?? ""}",`);
        lines.push(`  "${p.purpose}",`);
        lines.push(`  "${p.desc.replace(/"/g, '\\"')}",`);
        lines.push(`  ["/restaurants/xxx/placeholder.jpg"], [${specs}]),`);
        lines.push("");
      });
    }
    if (result.quote) {
      lines.push("=== quote ===");
      lines.push(`quote: "${result.quote.replace(/"/g, '\\"')}",`);
      lines.push("");
    }
    if (result.closing) {
      lines.push("=== closing ===");
      lines.push(`closing: "${result.closing.replace(/"/g, '\\"')}",`);
    }
    return lines.join("\n");
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(buildCopyText());
      setCopied(true);
      toast.success("コピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("コピー失敗");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="size-3.5" /> AI ドラフト生成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>URL から特集記事フルドラフト</DialogTitle>
          <DialogDescription>
            食べログ・公式 HP の URL から、Qualia / 汽ノ舎 / にし田 スタイルで
            titleHTML / lede / POINT 5つ / quote / closing を一気に生成します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="draft-feat-url">URL</Label>
            <Input
              id="draft-feat-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.soba-nishida.com/ 等"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="draft-feat-axis">記事の軸（任意）</Label>
            <Input
              id="draft-feat-axis"
              value={axis}
              onChange={(e) => setAxis(e.target.value)}
              placeholder="デート / ランチ / 観光 / 大人の食 等"
            />
          </div>

          {result && (
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  POINT・quote・closing コピペ用（data.ts へ）
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={copyAll}>
                  {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "コピー済" : "全てコピー"}
                </Button>
              </div>
              <Textarea
                readOnly
                value={buildCopyText()}
                rows={12}
                className="font-mono text-[10px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !url.trim()}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "生成中… (30〜60秒)" : "ドラフト生成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
