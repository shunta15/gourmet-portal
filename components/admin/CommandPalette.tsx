"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Store, Newspaper, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Hit =
  | { kind: "restaurant"; id: string; name: string; area: string; region: string; published: boolean }
  | { kind: "feature"; id: string; title: string; date: string; published: boolean };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘+K / Ctrl+K でトグル
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // open になったら input にフォーカス
  useEffect(() => {
    if (open) {
      setQ("");
      setHits([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 検索
  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const [rRes, fRes] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, area, region, published")
          .ilike("name", `%${q}%`)
          .limit(10),
        supabase
          .from("feature_articles")
          .select("id, title, date, published")
          .ilike("title", `%${q}%`)
          .limit(10),
      ]);
      if (cancelled) return;
      const merged: Hit[] = [
        ...(rRes.data ?? []).map((r: any) => ({ kind: "restaurant" as const, ...r })),
        ...(fRes.data ?? []).map((a: any) => ({ kind: "feature" as const, ...a })),
      ];
      setHits(merged);
      setActiveIndex(0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  function navigate(h: Hit) {
    setOpen(false);
    if (h.kind === "restaurant") router.push(`/admin/restaurants/${h.id}`);
    else router.push(`/admin/features/${h.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && hits[activeIndex]) {
      e.preventDefault();
      navigate(hits[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl mx-4 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="店舗名 / 特集タイトルで検索…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim() === "" ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              店舗・特集記事を横断検索します<br />
              <span className="mt-2 inline-block text-xs">
                <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono">↑↓</kbd> 移動 ·
                <kbd className="ml-2 rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> 開く
              </span>
            </div>
          ) : hits.length === 0 && !loading ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              該当なし
            </div>
          ) : (
            <ul className="space-y-0.5">
              {hits.map((h, i) => {
                const Icon = h.kind === "restaurant" ? Store : Newspaper;
                const active = i === activeIndex;
                return (
                  <li key={`${h.kind}-${h.id}`}>
                    <button
                      type="button"
                      onClick={() => navigate(h)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                        active && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="size-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {h.kind === "restaurant" ? (
                            <>
                              <span className="font-mono text-xs text-muted-foreground">{h.id}</span>
                              <span className="line-clamp-1">{h.name}</span>
                            </>
                          ) : (
                            <span className="line-clamp-1">{h.title}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {h.kind === "restaurant"
                            ? `${h.region} · ${h.area}`
                            : `特集 · ${h.date || "—"}`}
                          {!h.published && <span className="ml-2 text-rose-500">非公開</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
