"use client";
import { useSyncExternalStore } from "react";

/**
 * お気に入り(ハート)の保存。会員登録なし。保存先はこのブラウザの localStorage(キー machinowa:activity:fav:v1 に、店 ID の配列。入れた順)。
 * localStorage が使えない環境(プライベートモード・ブロック)でも画面は壊れない(そのページを開いているあいだだけ、メモリに保つ)。
 * 別のタブでの変更は storage イベントで拾う。サーバーでは空(初回の描画は常に空にして、ハイドレーションの不一致を避ける)。
 */
const KEY = "machinowa:activity:fav:v1";
const EMPTY: string[] = [];
const MAX = 60;
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/;

let mem: string[] = EMPTY;
let useMem = false;
let cacheRaw: string | null | undefined;
let cacheList: string[] = EMPTY;
const subs = new Set<() => void>();

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return EMPTY;
    const out = [...new Set(v.filter((x): x is string => typeof x === "string" && ID_RE.test(x)))].slice(0, MAX);
    return out.length ? out : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): string[] {
  if (useMem) return mem;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    useMem = true;
    return mem;
  }
  if (raw === cacheRaw) return cacheList;
  cacheRaw = raw;
  cacheList = parse(raw);
  return cacheList;
}

function emit() {
  subs.forEach((f) => f());
}

function subscribe(f: () => void): () => void {
  subs.add(f);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) f();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subs.delete(f);
    window.removeEventListener("storage", onStorage);
  };
}

function write(list: string[]) {
  const next = list.length ? list : EMPTY;
  if (!useMem) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      cacheRaw = undefined;
      emit();
      return;
    } catch {
      useMem = true;
    }
  }
  mem = next;
  emit();
}

/** 入れる ⇄ 外す。入れたら true、外したら false(上限を超えるときは何もせず null) */
export function toggleFav(id: string): boolean | null {
  if (!ID_RE.test(id)) return null;
  const cur = snapshot();
  if (cur.includes(id)) {
    write(cur.filter((x) => x !== id));
    return false;
  }
  if (cur.length >= MAX) return null;
  write([...cur, id]);
  return true;
}

/** お気に入りの店 ID の一覧(サーバー・初回の描画は空) */
export function useFavList(): string[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function useIsFav(id: string): boolean {
  return useFavList().includes(id);
}
