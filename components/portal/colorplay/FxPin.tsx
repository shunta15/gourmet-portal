"use client";
/**
 * 「留める」案(?fx=1)の動かす部分(クライアント)。縦に長い枠(.f1-track)の中で、画面に留まる舞台(.f1-stage)の「場面」を、
 * スクロールの位置から CSS 変数に入れる(動かすのは CSS)。
 *   --se  場面の位置(0 〜 steps。整数の近くでは少し留まり、その間で次の場面に替わる)
 *   --mx / --my  マウス/指の位置(舞台の中で -1〜1)
 * 窓(.f1-win)を押すと、次の場面までスクロールする(最後は店舗情報の手前へ)。スクロールそのものは奪わない(ふつうに払える)。
 * 見えている間だけ聞く(IntersectionObserver)。動きを減らす設定のときは何もしない(CSS が動かない完成形にする)。
 */
import { useEffect, useRef } from "react";

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export default function FxPin({ children, className, id, steps }: { children: React.ReactNode; className?: string; id?: string; steps: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    const stage = root?.querySelector<HTMLElement>(".f1-stage");
    if (!root || !stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let vis = false;
    let raf = 0;
    let last = -1;
    let tx = 0, ty = 0, cx = 0, cy = 0, pr = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const L = r.height - innerHeight;
      const p = L > 0 ? Math.min(1, Math.max(0, -r.top / L)) : 0;
      const s = p * steps;
      const i = Math.min(Math.floor(s), steps);
      const se = i >= steps ? steps : i + smooth((s - i - 0.28) / 0.44);
      const v = se.toFixed(3);
      if (v !== String(last)) {
        last = se;
        stage.style.setProperty("--se", v);
      }
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      stage.style.setProperty("--mx", cx.toFixed(3));
      stage.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.003 || Math.abs(ty - cy) > 0.003) { pr = 1; raf = requestAnimationFrame(update); } else pr = 0;
    };
    const go = () => {
      if (vis && !raf) raf = requestAnimationFrame(update);
    };
    const move = (e: PointerEvent) => {
      const b = stage.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      tx = ((e.clientX - b.left) / b.width) * 2 - 1;
      ty = ((e.clientY - b.top) / b.height) * 2 - 1;
      go();
    };
    const end = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") { tx = 0; ty = 0; go(); }
    };
    const next = () => {
      const r = root.getBoundingClientRect();
      const L = r.height - innerHeight;
      if (L <= 0) return;
      const cur = Math.round(last < 0 ? 0 : last);
      const target = cur >= steps ? document.getElementById("access") : null;
      const top = target ? target.getBoundingClientRect().top + scrollY - 60 : scrollY + r.top + (L * (cur + 1)) / steps;
      scrollTo({ top, behavior: "smooth" });
    };
    const btn = root.querySelector<HTMLElement>("[data-f1-next]");
    btn?.addEventListener("click", next);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; go(); }, { rootMargin: "50px" });
    io.observe(root);
    addEventListener("scroll", go, { passive: true });
    addEventListener("resize", go);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", move, { passive: true });
    addEventListener("pointerup", end, { passive: true });
    addEventListener("pointercancel", end, { passive: true });
    go();
    return () => {
      io.disconnect();
      btn?.removeEventListener("click", next);
      removeEventListener("scroll", go);
      removeEventListener("resize", go);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", move);
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      if (raf) cancelAnimationFrame(raf);
      void pr;
    };
  }, [steps]);
  return <div ref={ref} className={className} id={id}>{children}</div>;
}
