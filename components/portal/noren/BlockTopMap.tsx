"use client";
/**
 * 入口の「地図で見つける」の帯の地図（飾りに近い。イラスト地図 e = ShopMap を部品として使う）。
 * - 帯が画面に入ったとき 1 回だけ地図を出す（IntersectionObserver）。ピンが落ちる動きは、そのとき 1 回（ShopMap の動き。「動きを減らす」設定ではすぐ出る）
 * - 地図は動かさない（ページのスクロールを邪魔しない。拡大の操作部品も出さない）。ピン・写真の札だけ押せて、押すとその店のページへ
 *   （キーボードの Enter は、地図の標準の吹き出し → 「店のページへ」）
 * 大きなデータは持たない（店はサーバーで絞って props で来る）。
 */
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { MapPt } from "./ShopMap";

const ShopMap = dynamic(() => import("./ShopMap"), { ssr: false, loading: () => null });

const NONE_C: Record<string, number> = {};
const NONE_R: { key: string; name: string; count: number }[] = [];
const noop = () => {};

export default function BlockTopMap({ pts, regionKey, children }: { pts: MapPt[]; regionKey: string; children?: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // ピン・札は title に店名が入る。店名が 1 つの店だけを指すときだけ、押したら店ページへ直接行く（同じ店名が複数あれば、地図の標準の吹き出し）
  const idByName = useMemo(() => {
    const cnt = new Map<string, number>();
    for (const p of pts) cnt.set(p.name, (cnt.get(p.name) ?? 0) + 1);
    return new Map(pts.filter((p) => cnt.get(p.name) === 1).map((p) => [p.name, p.id]));
  }, [pts]);
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".leaflet-marker-icon[title]");
    const id = el ? idByName.get(el.getAttribute("title") ?? "") : undefined;
    if (!id) return;
    e.preventDefault();
    e.stopPropagation();
    router.push(`/restaurant/${encodeURIComponent(id)}`);
  };
  return (
    <div className="vBkt-band" ref={wrap}>
      <div className="vBkt-map" onClickCapture={onClickCapture}>
        {on && <ShopMap mode="e" regionKey={regionKey} pts={pts} prefCounts={NONE_C} prefRegion={NONE_C as unknown as Record<string, string>} regionCounts={NONE_R} onPick={noop} />}
      </div>
      {children}
    </div>
  );
}
