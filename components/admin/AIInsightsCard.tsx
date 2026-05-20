"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, ArrowRight } from "lucide-react";

type Insight = { title: string; body: string; action?: string };

export default function AIInsightsCard() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "AI 失敗");
        return;
      }
      setInsights(json.insights || []);
    } catch (e: any) {
      setError(e?.message || "通信エラー");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI からの今日のおすすめ作業
          </CardTitle>
          <CardDescription>
            サイト運用データから AI が次にやると効果的な作業を提案します
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          {insights ? "再生成" : "生成"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!insights && !loading && !error && (
          <p className="text-sm text-muted-foreground">「生成」を押すと AI が運用データを分析して提案します</p>
        )}
        {loading && (
          <p className="text-sm text-muted-foreground">分析中…（5〜10 秒）</p>
        )}
        {insights?.map((i, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">{i.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{i.body}</div>
              </div>
              {i.action && (
                <Link
                  href={i.action}
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  開く <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
