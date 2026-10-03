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
 */
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { formatJst, getOpenStatus, isOpenState, type OpenResult, type Week } from "@/lib/portal/openNow";

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

/** 現在時刻（epoch ミリ秒。分の頭に丸める）。サーバー・ハイドレーション中は null */
export function useNowMs(): number | null {
  const m = useSyncExternalStore(
    subscribeTime,
    () => minuteNow,
    () => null,
  );
  return m === null ? null : m * 60000;
}

/* ───────────── 絞り込み（?open=1） ───────────── */

const openSubs = new Set<() => void>();

function readOpenOnly(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("open") === "1";
  } catch {
    return false;
  }
}

function subscribeOpen(cb: () => void) {
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
  if (!weeks || now === null) return null;
  const i = weeks.index[id];
  return getOpenStatus(i === undefined ? null : (weeks.table[i] ?? null), now);
}

/**
 * 「今開いている店」の範囲。中のバッジ・件数・切替スイッチが、この表を使って判定する。
 * ?open=1 かつ現在時刻が分かった後は .mp-open-only を付け、CSS が営業中でない店を隠す。
 */
export function OpenScope({ weeks, children }: { weeks: WeekTableProp; children: ReactNode }) {
  const only = useOpenOnly();
  const now = useNowMs();
  return (
    <Ctx.Provider value={weeks}>
      <div className={only && now !== null ? "mp-open-scope mp-open-only" : "mp-open-scope"}>{children}</div>
    </Ctx.Provider>
  );
}

const LABEL: Record<string, string> = {
  open: "営業中",
  soon: "まもなく閉店",
  closed: "営業時間外",
  unknown: "営業時間不明",
};

/** 店カードのバッジ。判定前（サーバー・ハイドレーション中）は中身が空 */
export function OpenBadge({ id }: { id: string }) {
  const weeks = useContext(Ctx);
  const now = useNowMs();
  const r = statusOf(weeks, id, now);
  const s = r?.state ?? "pending";
  return (
    <span className="mp-ob" data-s={s}>
      {r && (
        <>
          <b>{LABEL[s]}</b>
          {s !== "unknown" && <small>（店の案内の営業時間による）</small>}
        </>
      )}
    </span>
  );
}

/** 見出しの「N店」。絞り込み中は、営業中（まもなく閉店を含む）の店の数にする */
export function OpenCount({ ids, unit = "店" }: { ids: string[]; unit?: string }) {
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

/** 一覧の上の切替（今開いている店だけ）と、判定の根拠・注意書き */
export function OpenBar({ ids }: { ids: string[] }) {
  const weeks = useContext(Ctx);
  const only = useOpenOnly();
  const now = useNowMs();
  const counts = { open: 0, soon: 0, closed: 0, unknown: 0 };
  if (now !== null) {
    for (const id of ids) {
      const r = statusOf(weeks, id, now);
      if (r) counts[r.state]++;
    }
  }
  return (
    <div className="mp-obar">
      <label className="mp-obar-switch">
        <input type="checkbox" checked={only} onChange={(e) => setOpenOnly(e.target.checked)} />
        <span className="tr" aria-hidden="true">
          <i />
        </span>
        <span className="tx">今開いている店だけ</span>
      </label>
      <p className="mp-obar-sum" aria-live="polite">
        {now !== null ? (
          <>
            <span className="at">{formatJst(now)} 時点</span>
            <span>
              営業中 <b>{counts.open + counts.soon}</b>店
              {counts.soon > 0 && <small>（うちまもなく閉店 {counts.soon}店）</small>}
            </span>
            <span>
              営業時間外 <b>{counts.closed}</b>店
            </span>
            <span>
              営業時間不明 <b>{counts.unknown}</b>店
            </span>
          </>
        ) : null}
      </p>
      <p className="mp-obar-note">
        営業中・営業時間外は、店の案内にある営業時間と定休日をもとに、日本時間の現在時刻で判定しています。
        営業時間や定休日が読み取れない店は「営業時間不明」です。
        <small>臨時休業・祝日は店にご確認ください。</small>
      </p>
    </div>
  );
}
