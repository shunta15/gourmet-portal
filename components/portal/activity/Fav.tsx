"use client";
import { toggleFav, useIsFav } from "./favs";
import { IcHeart } from "./Deco";

/** お気に入りの丸いボタン(店の紹介の「公式サイトで確認する」の横)。押すと、この端末(ブラウザ)に保存される。お気に入りだけの一覧は探す(?fav=1) */
export default function Fav({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const on = useIsFav(id);
  return (
    <button type="button" className={`${className}${on ? " is-on" : ""}`} aria-pressed={on} aria-label={on ? `${name}をお気に入りから外す` : `${name}をお気に入りに入れる`} title={on ? "お気に入りから外す" : "お気に入りに入れる(この端末に保存)"} onClick={() => toggleFav(id)}>
      <IcHeart />
    </button>
  );
}
