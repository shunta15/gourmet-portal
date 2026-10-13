"use client";

/**
 * 押してから行き先が出るまでの 1 秒前後に、何も起きないように見えないための部品（グルメの枠 NorenFrame と、周りのページの枠 PeripheryFrame が 1 つ置く。見た目は navpending.css）。
 *  - 押した瞬間に、押したリンクを薄くして（data-nav-pressed）、上端に朱の細い進みの線を出す（html の data-nav-pending）。行き先に着いたら（パスか引数が変わったら）消す。上限は 12 秒。
 *    ページ内のジャンプ（#）・同じ URL・別タブ・別サイト・修飾キー付きは対象外。リンクの動き自体は変えない（読み取るだけ）。
 *  - 行き先の先読み: 特集の一覧 /feature は URL の引数を読む動的ページで、Link の既定（auto）では先読みされない（動的なページは loading.js が無いと対象外。
 *    node_modules/next/dist/docs/01-app/02-guides/prefetching.md）。prefetch={true} の見えない Link を画面の隅に 1 つ置いて、全体を先に読んでおく（本番のみ働く）。
 */
import "./navpending.css";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const clear = () => {
  document.documentElement.removeAttribute("data-nav-pending");
  document.querySelectorAll("[data-nav-pressed]").forEach((e) => e.removeAttribute("data-nav-pressed"));
};

/** 行き先に着いた（パスか引数が変わった）ら消す */
function Arrived() {
  const path = usePathname();
  const sp = useSearchParams();
  const key = `${path}?${sp.toString()}`;
  useEffect(() => {
    clear();
  }, [key]);
  return null;
}

export default function NavPending({ prefetch = ["/feature"] }: { prefetch?: string[] }) {
  const path = usePathname();
  useEffect(() => {
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let u: URL;
      try {
        u = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // 同じページ（#へのジャンプ）
      document.documentElement.setAttribute("data-nav-pending", "1");
      a.setAttribute("data-nav-pressed", "1");
      window.clearTimeout(timer);
      timer = window.setTimeout(clear, 12000);
    };
    const onPageShow = () => clear(); // 戻る・進むで復元されたとき
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPageShow);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPageShow);
    };
  }, []);
  return (
    <>
      <Suspense fallback={null}>
        <Arrived />
      </Suspense>
      <span className="navp-bar" aria-hidden="true" />
      {prefetch
        .filter((h) => h !== path)
        .map((h) => (
          <Link key={h} href={h} prefetch className="navp-hint" tabIndex={-1} aria-hidden="true" />
        ))}
    </>
  );
}
