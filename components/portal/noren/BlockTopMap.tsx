"use client";
/**
 * 入口の「地図で見つける」の帯の地図（飾りに近い。イラスト地図 e = ShopMap を部品として使う）。
 * - 帯が画面に入ったとき 1 回だけ地図を出す（IntersectionObserver）。ピンが落ちる動きは、そのとき 1 回（ShopMap の動き。「動きを減らす」設定ではすぐ出る）
 * - 地図は動かさない（ページのスクロールを邪魔しない。拡大の操作部品も出さない）。立つのはピンだけ（写真つきの札はやめた）。
 *   ピンを押す（キーボードは Enter）と、店の情報の札（ShopMap の PinCard。写真・店名・エリアと最寄り駅・業種・「店のページへ →」）。札は帯の中（文字・ぼかしの上）に出す。
 * 大きなデータは持たない（店はサーバーで絞って props で来る）。
 */
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { MapPt } from "./ShopMap";

const ShopMap = dynamic(() => import("./ShopMap"), { ssr: false, loading: () => null });

const NONE_C: Record<string, number> = {};
const NONE_R: { key: string; name: string; count: number }[] = [];
const noop = () => {};

export default function BlockTopMap({ pts, regionKey, mode = "e", children }: { pts: MapPt[]; regionKey: string; /** 地図の絵: e = 手描き風（明るい）、g = 夜の灯り（暗い地に合う） */ mode?: "e" | "g"; children?: React.ReactNode }) {
  // 帯の要素（札を出す先にも使う）
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!wrap) return;
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
    io.observe(wrap);
    return () => io.disconnect();
  }, [wrap]);
  return (
    <div className="vBkt-band" ref={setWrap}>
      <div className="vBkt-map">
        {on && <ShopMap mode={mode} regionKey={regionKey} pts={pts} prefCounts={NONE_C} prefRegion={NONE_C as unknown as Record<string, string>} regionCounts={NONE_R} onPick={noop} cardHost={wrap} />}
      </div>
      {children}
    </div>
  );
}
