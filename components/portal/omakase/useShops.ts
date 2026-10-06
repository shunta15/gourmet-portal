"use client";
/**
 * 結果に出す店の表示用データを、候補リストと同じ静的 JSON（/list-data/{店ID}。app/list-data/[id]/route.ts）から取る。
 * 全店のデータはクライアントに渡さず、いま出す 3 軒ぶんだけを取る。取れた店はこのモジュールの中で使い回す。
 */
import { useEffect, useState } from "react";
import type { ListShop } from "@/lib/portal/listShop";

const cache = new Map<string, Promise<ListShop | null>>();

export function loadShop(id: string): Promise<ListShop | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/list-data/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? (r.json() as Promise<ListShop>) : null))
      .catch(() => null)
      .then((v) => {
        if (v === null) cache.delete(id); // 失敗は覚えない（次に取り直せる）
        return v;
      });
    cache.set(id, p);
  }
  return p;
}

/** 先読み（結果を待たせないため、次に出す店を先に取っておく） */
export function prefetchShops(ids: string[]) {
  for (const id of ids) void loadShop(id);
}

export interface ShopsState {
  shops: Map<string, ListShop>;
  /** ids の全部を取り終えた（失敗した店は取れなかったものとして、shops に入らない） */
  ready: boolean;
  /** 取れなかった店がある */
  failed: boolean;
}

export function useShops(ids: string[]): ShopsState {
  const key = ids.join(",");
  const [state, setState] = useState<{ key: string } & Omit<ShopsState, "ready">>({ key: "", shops: new Map(), failed: false });
  useEffect(() => {
    let alive = true;
    if (ids.length === 0) {
      setState({ key, shops: new Map(), failed: false });
      return;
    }
    Promise.all(ids.map((id) => loadShop(id))).then((list) => {
      if (!alive) return;
      const shops = new Map<string, ListShop>();
      list.forEach((s) => s && shops.set(s.id, s));
      setState({ key, shops, failed: shops.size < ids.length });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { shops: state.shops, failed: state.failed, ready: state.key === key };
}
