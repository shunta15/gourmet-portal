"use client";
import { toggleFav, useIsFav } from "./favs";
import { IcHeart } from "./Deco";

/** 札(店のカード)の隅のハート。押すと、この端末(ブラウザ)にお気に入りとして保存される(札のリンクは開かない) */
export default function FavHeart({ id, name }: { id: string; name: string }) {
  const on = useIsFav(id);
  const flip = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(id);
  };
  return (
    <span
      role="button"
      tabIndex={0}
      className={`apa-card-heart${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? `${name}をお気に入りから外す` : `${name}をお気に入りに入れる`}
      onClick={flip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") flip(e);
      }}
    >
      <IcHeart />
    </span>
  );
}
