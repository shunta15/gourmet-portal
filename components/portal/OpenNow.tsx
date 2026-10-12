"use client";
/**
 * 「今開いている店」の表示部品（クライアント）。
 *
 * 判定は現在時刻（日本時間）に依存するので、サーバーでは判定しない（キャッシュで古くなる・ハイドレーションがずれる）。
 * サーバーが描くのは「判定前」の状態（バッジは空・絞り込みなし）。マウント後にクライアントで現在時刻を見て判定する。
 * 判定の元は、サーバーが解析して渡す週の営業予定（lib/portal/openNow の Week）。ここで文字列は解析しない。
 *
 * 絞り込みの状態は URL の ?open=1 と同期する（useSyncExternalStore で location.search を読む。
 * Suspense やサーバー側の searchParams は使わない＝駅ページなどの静的ページのまま）。
 * 絞り込みは CSS で行う（.mp-open-only のとき、営業中でないバッジを持つ li と、営業中の店が無いグループを隠す）。
 *
 * 2026-10-12 オーナー決定「今営業中の概念無くしていい」: OPEN_NOW_ON（lib/portal/openNow.ts。RELEASE_REST が true のあいだ false）が false のときは、
 * この部品はすべて何も出さず・何も判定しない（タイマーを動かさない・location を読まない・?open=1 は無視・OpenBar と OpenBadge は空）。
 */
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { OPEN_NOW_ON, getOpenStatus, isOpenState, type OpenResult, type Week } from "@/lib/portal/openNow";

export interface WeekTableProp {
  table: (Week | null)[];
  index: Record<string, number>;
}

/* ───────────── 現在時刻（分単位で更新。サーバー・ハイドレーション中は null） ───────────── */

let minuteNow: number | null = null;
const timeSubs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  const m = Math.floor(Date.now() / 60000);
  if (m !== minuteNow) {
    minuteNow = m;
    timeSubs.forEach((f) => f());
  }
}

function subscribeTime(cb: () => void) {
  timeSubs.add(cb);
  if (!timer) timer = setInterval(tick, 20000);
  tick();
  return () => {
    timeSubs.delete(cb);
    if (timeSubs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const noSubscribe = () => () => {};

/** 現在時刻（epoch ミリ秒。分の頭に丸める）。サーバー・ハイドレーション中は null。OPEN_NOW_ON が false のあいだは常に null（タイマーも動かさない） */
export function useNowMs(): number | null {
  const m = useSyncExternalStore(
    OPEN_NOW_ON ? subscribeTime : noSubscribe,
    () => (OPEN_NOW_ON ? minuteNow : null),
    () => null,
  );
  return m === null ? null : m * 60000;
}

/* ───────────── 絞り込み（?open=1） ───────────── */

const openSubs = new Set<() => void>();

function readOpenOnly(): boolean {
  if (!OPEN_NOW_ON) return false;
  try {
    return new URLSearchParams(window.location.search).get("open") === "1";
  } catch {
    return false;
  }
}

function subscribeOpen(cb: () => void) {
  if (!OPEN_NOW_ON) return () => {};
  openSubs.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    openSubs.delete(cb);
    window.removeEventListener("popstate", cb);
  };
}

/** 「今開いている店だけ」が URL（?open=1）で指定されているか。サーバー・ハイドレーション中は false */
export function useOpenOnly(): boolean {
  return useSyncExternalStore(subscribeOpen, readOpenOnly, () => false);
}

export function setOpenOnly(on: boolean) {
  if (!OPEN_NOW_ON) return;
  const url = new URL(window.location.href);
  if (on) url.searchParams.set("open", "1");
  else url.searchParams.delete("open");
  // Next.js の History API 連携（router と同期する）。state は null を渡すのが公式の書き方
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  openSubs.forEach((f) => f());
}

/* ───────────── 営業予定の表（コンテキスト） ───────────── */

const Ctx = createContext<WeekTableProp | null>(null);

export function statusOf(weeks: WeekTableProp | null | undefined, id: string, now: number | null): OpenResult | null {
  if (!OPEN_NOW_ON || !weeks || now === null) return null;
  const i = weeks.index[id];
  return getOpenStatus(i === undefined ? null : (weeks.table[i] ?? null), now);
}

/**
 * 「今開いている店」の範囲。中のバッジ・件数・切替スイッチが、この表を使って判定する。
 * ?open=1 かつ現在時刻が分かった後は .mp-open-only を付け、CSS が営業中でない店を隠す。
 */
export function OpenScope({ weeks, children }: { weeks: WeekTableProp; children: ReactNode }) {
  if (!OPEN_NOW_ON) return <div className="mp-open-scope">{children}</div>;
  return <OpenScopeInner weeks={weeks}>{children}</OpenScopeInner>;
}

function OpenScopeInner({ weeks, children }: { weeks: WeekTableProp; children: ReactNode }) {
  const only = useOpenOnly();
  const now = useNowMs();
  return (
    <Ctx.Provider value={weeks}>
      <div className={only && now !== null ? "mp-open-scope mp-open-only" : "mp-open-scope"}>{children}</div>
    </Ctx.Provider>
  );
}

/**
 * 店カードの目印。2026-10-09 オーナー指示で「営業中」などの表記は出さない（文字は無し・非表示）。
 * 「今開いている店だけ」の絞り込み（CSS の :has）が data-s を見て動くので、要素と data-s は残す。判定前（サーバー・ハイドレーション中）は pending。
 */
export function OpenBadge({ id }: { id: string }) {
  if (!OPEN_NOW_ON) return null;
  return <OpenBadgeInner id={id} />;
}

function OpenBadgeInner({ id }: { id: string }) {
  const weeks = useContext(Ctx);
  const now = useNowMs();
  const r = statusOf(weeks, id, now);
  return <span className="mp-ob" data-s={r?.state ?? "pending"} hidden />;
}

/** 見出しの「N店」。絞り込み中は、営業中（まもなく閉店を含む）の店の数にする */
export function OpenCount({ ids, unit = "店" }: { ids: string[]; unit?: string }) {
  if (!OPEN_NOW_ON) return <>{ids.length}{unit}</>;
  return <OpenCountInner ids={ids} unit={unit} />;
}

function OpenCountInner({ ids, unit }: { ids: string[]; unit: string }) {
  const weeks = useContext(Ctx);
  const only = useOpenOnly();
  const now = useNowMs();
  if (!only || now === null) return <>{ids.length}{unit}</>;
  const n = ids.filter((id) => {
    const r = statusOf(weeks, id, now);
    return r !== null && isOpenState(r.state);
  }).length;
  return <>{n}{unit}</>;
}

/** 一覧の上の切替（今開いている店だけ）と、判定の根拠・注意書き。「営業中 N店」などの件数は出さない（2026-10-09 オーナー指示） */
export function OpenBar(_props: { ids?: string[] }) {
  if (!OPEN_NOW_ON) return null;
  return <OpenBarInner />;
}

function OpenBarInner() {
  const only = useOpenOnly();
  return (
    <div className="mp-obar">
      <label className="mp-obar-switch">
        <input type="checkbox" checked={only} onChange={(e) => setOpenOnly(e.target.checked)} />
        <span className="tr" aria-hidden="true">
          <i />
        </span>
        <span className="tx">今開いている店だけ</span>
      </label>
      <p className="mp-obar-note">
        店の案内にある営業時間と定休日をもとに、日本時間の現在時刻で判定しています。営業時間や定休日が読み取れない店は、絞り込み中は出ません。
        <small>臨時休業・祝日は店にご確認ください。</small>
      </p>
    </div>
  );
}
