"use client";
import { useLayoutEffect, useRef } from "react";
import { RANDOM_KEYS } from "@/lib/portal/hubs/nigiwai/themes";

/**
 * 名前なしのルート（総合トップ）の色の抽選。クライアント（見た目は何も出さない）。
 *
 * 抽選は 2 つの道で行う。どちらも「その履歴の項目（history.state.ngTheme）に、選んだ色を覚える」ので、ブラウザの戻る・進むで同じ色に戻る。
 *   1. 文書を読み込んだとき … NigiwaiPage が最初に置く短い処理（インライン script と <img onerror>。最初の描画より前に data-theme を決める）。
 *      このとき根に data-ng-boot が付くので、ここでは何も変えない（覚えるだけ）。
 *   2. ブラウザの中でのページ移動（<Link>・戻る）で来たとき … 移動で描かれた新しい DOM の script は動かない（React が止める）ので、
 *      ここで決める。useLayoutEffect は描画の前に走るので、既定の色が一瞬見えることはない。
 *      Next は、移動で履歴を更新する処理（useInsertionEffect）をこの効果より先に済ませる。戻る・進むでは、前に覚えた色が残っている
 *      （completeTraverseNavigation が custom history state を保つ）。リンクで来たときは新しい項目なので、抽選し直す。
 * 再読み込み（F5）は、script 側で抽選し直す（Navigation Timing の type が reload）。
 * 抽選の中身（RANDOM_KEYS の半々）は、NigiwaiPage の script と同じ。
 */
export default function RandomTheme() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".ngp");
    if (!root) return;
    const keep = (t: string) => {
      try {
        window.history.replaceState({ ...(window.history.state ?? {}), ngTheme: t }, "");
      } catch {
        /* 覚えられなくても色は出る */
      }
    };
    if (root.dataset.ngBoot === "1") {
      keep(root.dataset.theme ?? RANDOM_KEYS[0]);
      return;
    }
    const saved = (window.history.state as { ngTheme?: string } | null)?.ngTheme;
    const t = (RANDOM_KEYS as readonly string[]).includes(saved ?? "") ? (saved as string) : RANDOM_KEYS[Math.random() < 0.5 ? 0 : 1];
    root.setAttribute("data-theme", t);
    keep(t);
  }, []);
  return <span ref={ref} hidden />;
}
