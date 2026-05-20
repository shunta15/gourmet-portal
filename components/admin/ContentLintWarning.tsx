"use client";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * 編集トーンガイドの禁止表現をテキストから検出して警告
 * - 「日本一」「最強」「絶対」「必ず」（根拠なき断定）
 * - 「人気」「おすすめ」（根拠なし時）→ ただし誤検知が多いので警告レベル
 * - 「○年現在」（年号付き料金表記）→ 「訪問前に公式確認」推奨
 * - 食べログ直接コピペが疑われる定型句
 */
const RULES: { pattern: RegExp; label: string; severity: "error" | "warn"; suggest?: string }[] = [
  { pattern: /日本一/, label: "「日本一」", severity: "error", suggest: "出典を明記するか、削除してください" },
  { pattern: /最強/, label: "「最強」", severity: "error", suggest: "根拠なき強調表現は禁止" },
  { pattern: /絶対/, label: "「絶対」", severity: "error", suggest: "「ぜひ」「強くおすすめしたい」等に言い換えを" },
  { pattern: /必ず/, label: "「必ず」", severity: "warn", suggest: "断定が強すぎる可能性。注意点としては OK" },
  { pattern: /\d{4}年.*?(?:円|料金|営業)/, label: "年号付き料金/営業表記", severity: "warn", suggest: "「訪問前に公式確認」に置き換え推奨" },
  { pattern: /(?:言わずと知れた|知る人ぞ知る|押すに押されぬ)/, label: "食べログ調の定型句", severity: "warn", suggest: "オリジナル表現に書き換え推奨" },
];

export default function ContentLintWarning({ text }: { text: string }) {
  const hits = useMemo(() => {
    if (!text || text.length < 4) return [];
    const result: { label: string; severity: "error" | "warn"; suggest?: string }[] = [];
    for (const rule of RULES) {
      if (rule.pattern.test(text)) {
        result.push({ label: rule.label, severity: rule.severity, suggest: rule.suggest });
      }
    }
    return result;
  }, [text]);

  if (hits.length === 0) return null;

  const hasError = hits.some((h) => h.severity === "error");

  return (
    <Alert variant={hasError ? "destructive" : "default"} className="mt-2">
      <AlertTriangle className="size-4" />
      <AlertDescription>
        <div className="font-medium text-xs">
          編集トーンガイドの{hasError ? "禁止表現" : "注意"}が検出されました
        </div>
        <ul className="mt-1 space-y-0.5 text-xs">
          {hits.map((h, i) => (
            <li key={i}>
              <span className={h.severity === "error" ? "font-semibold" : ""}>{h.label}</span>
              {h.suggest && <span className="opacity-80"> — {h.suggest}</span>}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
