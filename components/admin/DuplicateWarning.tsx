"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";

type Match = {
  id: string;
  name: string;
  area: string;
  region: string;
  similarity: number; // 0..1
};

/**
 * 店舗名 / 地域から既存の類似レコードを探して警告する。
 * 完全一致 → 名前が ilike で部分一致 → 同じ region で部分一致 の順に評価。
 */
export default function DuplicateWarning({
  name,
  region,
  area,
  excludeId,
}: {
  name: string;
  region: string;
  area?: string;
  excludeId?: string;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!name.trim() || name.length < 2) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const timer = setTimeout(async () => {
      const supabase = createClient();
      // 大文字小文字無視で名前部分一致 OR 同一エリア
      let query = supabase
        .from("restaurants")
        .select("id, name, area, region")
        .limit(5);
      if (region) {
        query = query.eq("region", region);
      }
      query = query.ilike("name", `%${name}%`);
      const { data } = await query;
      if (cancelled) return;

      // 簡易類似度計算（部分文字列でスコア）
      const results: Match[] = (data ?? [])
        .filter((r: any) => r.id !== excludeId)
        .map((r: any) => {
          const a = name.toLowerCase();
          const b = r.name.toLowerCase();
          let sim = 0;
          if (a === b) sim = 1;
          else if (b.includes(a) || a.includes(b)) sim = 0.85;
          else {
            // 共通文字数で大雑把に
            const set = new Set([...a]);
            let hit = 0;
            for (const c of b) if (set.has(c)) hit++;
            sim = hit / Math.max(a.length, b.length);
          }
          // 同エリアならボーナス
          if (area && r.area && r.area.includes(area)) sim = Math.min(1, sim + 0.1);
          return { ...r, similarity: sim };
        })
        .filter((r) => r.similarity > 0.4)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      setMatches(results);
      setChecking(false);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, region, area, excludeId]);

  if (matches.length === 0 || checking) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertDescription>
        <div className="font-medium">類似する既存店舗が見つかりました</div>
        <div className="mt-1 text-xs">重複登録を避けるため、念のため確認してください。</div>
        <ul className="mt-2 space-y-1">
          {matches.map((m) => (
            <li key={m.id} className="text-sm">
              <Link
                href={`/admin/restaurants/${m.id}`}
                className="inline-flex items-center gap-1 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-mono text-xs opacity-70">{m.id}</span>
                <span>{m.name}</span>
                <span className="text-xs opacity-70">
                  ({m.region}{m.area ? ` / ${m.area}` : ""}, 類似度 {Math.round(m.similarity * 100)}%)
                </span>
                <ExternalLink className="size-3" />
              </Link>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
