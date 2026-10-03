/**
 * 総合トップの WebGL「絹」を出してよいか／いつ始めるか（クライアント専用）。
 *
 * 表示速度のため、絹は「LCP の後・アイドル時」に初期化する。次の環境では最初から出さず、
 * CSS のグラデーション（.mp-silk-fallback）だけにする。
 *  - 動きを減らす設定（prefers-reduced-motion）
 *  - スマホ幅（960px 以下）・タッチ主体の端末
 *  - データ節約（Save-Data / prefers-reduced-data）
 *  - 低電力の目安（メモリ 2GB 以下・CPU 2コア以下・電池 20% 以下で充電していない）
 */

type NavExtra = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
  getBattery?: () => Promise<{ charging: boolean; level: number }>;
};

/** 同期で分かる条件だけ */
export function silkAllowed(): boolean {
  const mq = (q: string) => matchMedia(q).matches;
  if (mq("(prefers-reduced-motion: reduce)")) return false;
  if (mq("(max-width: 960px)")) return false;
  if (mq("(hover: none) and (pointer: coarse)")) return false;
  if (mq("(prefers-reduced-data: reduce)")) return false;
  const nav = navigator as NavExtra;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false;
  return true;
}

/** 電池が少なく充電もしていないなら false（Battery API が無い環境では true） */
async function batteryOk(): Promise<boolean> {
  try {
    const b = await (navigator as NavExtra).getBattery?.();
    if (b && !b.charging && b.level <= 0.2) return false;
  } catch {
    /* 取れなければ気にしない */
  }
  return true;
}

/**
 * LCP の後・アイドル時に run を呼ぶ。キャンセル用の関数を返す。
 * 「ページの load が終わり、LCP の候補が出ている」状態を待ち、そのあと requestIdleCallback。
 * どちらも来ないときのために、最長 6 秒で打ち切る。
 */
export function afterLcpIdle(run: () => void): () => void {
  let cancelled = false;
  let fired = false;
  let po: PerformanceObserver | undefined;
  const timers: number[] = [];

  const fire = () => {
    if (cancelled || fired) return;
    fired = true;
    po?.disconnect();
    const idle = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
    idle(
      () => {
        if (cancelled) return;
        void batteryOk().then((ok) => {
          if (ok && !cancelled) run();
        });
      },
      { timeout: 2500 },
    );
  };

  let loaded = document.readyState === "complete";
  let lcpSeen = false;
  const check = () => {
    if (loaded && lcpSeen) fire();
  };
  try {
    po = new PerformanceObserver((list) => {
      if (list.getEntries().length > 0) {
        lcpSeen = true;
        check();
      }
    });
    po.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    lcpSeen = true; // LCP を測れない環境では load だけ待つ
  }
  const onLoad = () => {
    loaded = true;
    check();
  };
  if (!loaded) window.addEventListener("load", onLoad, { once: true });
  timers.push(window.setTimeout(fire, 6000));
  check();

  return () => {
    cancelled = true;
    po?.disconnect();
    window.removeEventListener("load", onLoad);
    timers.forEach(clearTimeout);
  };
}
