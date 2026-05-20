"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";

export default function SetupClient({
  sql0002,
  sql0003,
}: {
  sql0002: string;
  sql0003: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} をコピーしました`);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      toast.error("クリップボードへのコピーに失敗");
    }
  }

  return (
    <div className="space-y-4">
      <ol className="list-decimal pl-5 space-y-2 text-sm">
        <li>
          下の <strong>「0002 をコピー」</strong> を押す
        </li>
        <li>
          <a
            href="https://supabase.com/dashboard/project/kffbwercoywjaayvjmbt/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            Supabase SQL Editor を開く <ExternalLink className="size-3.5" />
          </a>{" "}
          に貼り付け → Run
        </li>
        <li>同じ要領で <strong>0003</strong> もコピペ→Run</li>
        <li>このページをリロード → ステータスが「適用済み」に変わる</li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={copied === "0002" ? "default" : "outline"}
          onClick={() => copy(sql0002, "0002")}
        >
          {copied === "0002" ? (
            <>
              <CheckCircle2 className="size-4" /> 0002 コピー済み
            </>
          ) : (
            <>
              <Copy className="size-4" /> 0002 をコピー
            </>
          )}
        </Button>
        <Button
          type="button"
          variant={copied === "0003" ? "default" : "outline"}
          onClick={() => copy(sql0003, "0003")}
        >
          {copied === "0003" ? (
            <>
              <CheckCircle2 className="size-4" /> 0003 コピー済み
            </>
          ) : (
            <>
              <Copy className="size-4" /> 0003 をコピー
            </>
          )}
        </Button>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          0002 の中身を見る ({sql0002.length} 字)
        </summary>
        <pre className="mt-2 max-h-64 overflow-y-auto rounded bg-muted/40 p-3 font-mono text-[10px]">
          {sql0002.slice(0, 4000)}
          {sql0002.length > 4000 && "\n…（省略）"}
        </pre>
      </details>
    </div>
  );
}
