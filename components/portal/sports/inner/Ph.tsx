import type { CSSProperties } from "react";
import type { Slot } from "./shop/copy";

type Photo = { src: string; alt: string };

/** 店の実写を枠に敷く。同じ写真を繰り返すとき(足りない枠)は、位置・拡大を変えて別の切り取りにする。 */
export default function Ph({ photos, slot, className, eager }: { photos: Photo[]; slot: Slot; className?: string; eager?: boolean }) {
  if (photos.length === 0) return null; // 写真の無い店は、枠の灰色の地だけが出る
  const p = photos[slot[0] % photos.length];
  const [, x = 50, y = 50, z = 1] = slot;
  const style: CSSProperties = { objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: z !== 1 ? `scale(${z})` : undefined };
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img className={className ? `s2b-ph ${className}` : "s2b-ph"} src={p.src} alt={p.alt} style={style} loading={eager ? "eager" : "lazy"} decoding="async" />;
}
