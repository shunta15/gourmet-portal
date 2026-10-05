/**
 * 候補リスト（店を保存）の保存先と、共有 URL の読み書き。クライアント専用の部品から使う。
 * 会員登録なし。保存先はブラウザの localStorage（キー machinowa:list:v1 に、店 ID の配列。保存した順。最大 50 店）。
 *
 * - localStorage が使えない環境（プライベートモード・ブロック・容量超過）でも画面は壊れない。
 *   読み書きの失敗を検知したら、メモリ上の配列に切り替える（そのページを開いているあいだだけ保たれる）。
 *   `isPersistent()` が false のときは、画面に「このブラウザでは保存が残りません」と出す。
 * - 別のタブでの変更は storage イベントで拾って、画面に反映する。
 * - サーバーでは `getServerList()`（空）を返す。ハイドレーションの不一致を避けるため、初回の描画は常に空。
 * - 店 ID だけを扱う（店名・写真などは持たない）。共有 URL にも店 ID だけを入れる（/list?ids=r33,r16,…）。
 *
 * サーバー専用の import（lib/data・lib/db 等）はしない。"use client" の部品から import してよい。
 */
import { useSyncExternalStore } from "react";

export const LIST_KEY = "machinowa:list:v1";
/** 保存できる店の上限。共有 URL から読み込む店もこの数で切る */
export const LIST_MAX = 50;
/** 店 ID として受け付ける形（英数字・ハイフン・アンダースコア、先頭は英数字、32 文字まで） */
export const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/;

const EMPTY: string[] = [];

/* ───────────── 店 ID の検証・共有 URL ───────────── */

/** 配列から、形の正しい ID だけを重複なし・順序そのままで取り出す。上限を超える分は切る */
export function cleanIds(raw: unknown, max = LIST_MAX): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string" || !ID_RE.test(x) || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
    if (out.length >= max) break;
  }
  return out;
}

/** 共有 URL の ids パラメータ（"r33,r16,…"）を ID の配列にする。形の違うもの・重複は黙って除き、50 を超える分は切る */
export function parseIdsParam(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return cleanIds(raw.split(","));
}

/** 共有 URL のパス（クエリ付き）。店 ID は英数字・ハイフン・アンダースコアだけなのでそのまま書ける */
export function listPath(ids: readonly string[]): string {
  const clean = cleanIds([...ids]);
  return clean.length > 0 ? `/list?ids=${clean.join(",")}` : "/list";
}

/* ───────────── 保存先（localStorage → だめならメモリ） ───────────── */

let mem: string[] = EMPTY;
/** 保存に失敗して、メモリに切り替えた */
let useMem = false;
/** 直近に解析した localStorage の文字列と、その結果（同じ文字列なら同じ配列を返す＝useSyncExternalStore が安定する） */
let cacheRaw: string | null | undefined = undefined;
let cacheList: string[] = EMPTY;

const subs = new Set<() => void>();
let listening = false;

function readRaw(): string | null | undefined {
  try {
    return window.localStorage.getItem(LIST_KEY);
  } catch {
    return undefined; // 読めない
  }
}

/** いまの保存内容（保存した順）。呼び出しごとに新しい配列は作らない */
export function getList(): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (useMem) return mem;
  const raw = readRaw();
  if (raw === undefined) {
    // 読めない環境。メモリで続ける
    useMem = true;
    return mem;
  }
  if (raw === cacheRaw) return cacheList;
  let list = EMPTY;
  if (raw) {
    try {
      const c = cleanIds(JSON.parse(raw));
      list = c.length > 0 ? c : EMPTY;
    } catch {
      list = EMPTY; // 壊れた中身は空として扱う（次に保存したとき上書きされる）
    }
  }
  cacheRaw = raw;
  cacheList = list;
  return list;
}

export function getServerList(): string[] {
  return EMPTY;
}

/** 保存が（ブラウザを閉じても）残る状態か。メモリに切り替わっていたら false */
export function isPersistent(): boolean {
  if (typeof window === "undefined") return true;
  getList(); // 読めるかを確かめる
  return !useMem;
}

function notify() {
  subs.forEach((f) => f());
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key === LIST_KEY) notify();
}

export function subscribe(cb: () => void): () => void {
  subs.add(cb);
  if (!listening && typeof window !== "undefined") {
    listening = true;
    window.addEventListener("storage", onStorage);
  }
  return () => {
    subs.delete(cb);
  };
}

function write(next: string[]) {
  const list = cleanIds(next);
  if (!useMem) {
    try {
      if (list.length === 0) window.localStorage.removeItem(LIST_KEY);
      else window.localStorage.setItem(LIST_KEY, JSON.stringify(list));
    } catch {
      useMem = true;
    }
  }
  if (useMem) mem = list.length > 0 ? list : EMPTY;
  notify();
}

/* ───────────── 操作 ───────────── */

export type ToggleResult = "added" | "removed" | "full";

/** 入っていなければ末尾に足す／入っていれば外す。50 店に達していて足せないときは "full" */
export function toggleSaved(id: string): ToggleResult {
  if (!ID_RE.test(id)) return "full";
  const cur = getList();
  if (cur.includes(id)) {
    write(cur.filter((x) => x !== id));
    return "removed";
  }
  if (cur.length >= LIST_MAX) return "full";
  write([...cur, id]);
  return "added";
}

export function removeSaved(id: string): void {
  const cur = getList();
  if (cur.includes(id)) write(cur.filter((x) => x !== id));
}

/** 外した店を元の位置に戻す（「元に戻す」用）。すでにあるとき・満杯のときは何もしない */
export function insertSaved(id: string, index: number): boolean {
  const cur = getList();
  if (!ID_RE.test(id) || cur.includes(id) || cur.length >= LIST_MAX) return false;
  const next = [...cur];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, id);
  write(next);
  return true;
}

/** 店を 1 つ上（dir=-1）／下（dir=1）へ動かす */
export function moveSaved(id: string, dir: -1 | 1): void {
  const cur = getList();
  const i = cur.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= cur.length) return;
  const next = [...cur];
  [next[i], next[j]] = [next[j], next[i]];
  write(next);
}

export function clearSaved(): void {
  write([]);
}

/**
 * 複数の店を、まだ入っていないものだけ末尾に足す（共有された店を「自分の候補に全部入れる」）。
 * 50 店に収まらない分は足さない。戻り値は足した数・すでに入っていた数・収まらず足せなかった数。
 */
export function addManySaved(ids: readonly string[]): { added: number; already: number; skipped: number } {
  const cur = getList();
  const have = new Set(cur);
  const next = [...cur];
  let added = 0;
  let already = 0;
  let skipped = 0;
  for (const id of cleanIds([...ids])) {
    if (have.has(id)) {
      already++;
    } else if (next.length >= LIST_MAX) {
      skipped++;
    } else {
      next.push(id);
      have.add(id);
      added++;
    }
  }
  if (added > 0) write(next);
  return { added, already, skipped };
}

/* ───────────── React から使う ───────────── */

/** 保存している店 ID（保存した順）。サーバー・ハイドレーション中は空 */
export function useSavedList(): string[] {
  return useSyncExternalStore(subscribe, getList, getServerList);
}

/** 保存が残る状態か（localStorage が使えるか）。サーバー・ハイドレーション中は true（初回の描画をサーバーと合わせる） */
export function usePersistent(): boolean {
  return useSyncExternalStore(subscribe, isPersistent, () => true);
}

/** この店が保存済みか。サーバー・ハイドレーション中は false */
export function useIsSaved(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getList().includes(id),
    () => false,
  );
}

/* ───────────── 画面の小さなお知らせ（保存した・外した・満杯） ───────────── */

let toast = "";
let toastSeq = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const toastSubs = new Set<() => void>();

/** 画面の隅の案内文を出す（4 秒で消える）。表示は components/portal/ListEntry.tsx。読み上げ（aria-live）も兼ねる */
export function announce(message: string): void {
  toast = message;
  toastSeq++;
  toastSubs.forEach((f) => f());
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast = "";
    toastSubs.forEach((f) => f());
  }, 4000);
}

function subscribeToast(cb: () => void): () => void {
  toastSubs.add(cb);
  return () => {
    toastSubs.delete(cb);
  };
}

/** 案内文（無いときは空文字） */
export function useToast(): string {
  return useSyncExternalStore(
    subscribeToast,
    () => toast,
    () => "",
  );
}

/** 案内文が出された回数（同じ文言が続いても、出し直しを見分けるため） */
export function useToastSeq(): number {
  return useSyncExternalStore(
    subscribeToast,
    () => toastSeq,
    () => 0,
  );
}
