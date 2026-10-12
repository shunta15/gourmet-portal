"use client";
/**
 * ハートのボタン。押すと弾んで色が付く。保存は既存の「候補に入れる」の仕組み(lib/portal/savedList。端末の localStorage)に合わせる。
 */
import { useEffect, useRef, useState } from "react";
import { LIST_MAX, announce, getList, toggleSaved, useIsSaved } from "@/lib/portal/savedList";
import { IconHeart } from "./Icons";

export default function Heart({ id, name, className = "" }: { id: string; name: string; className?: string }) {
  const saved = useIsSaved(id);
  const [pop, setPop] = useState(0);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const on = () => {
    const r = toggleSaved(id);
    if (r === "full") {
      announce(`候補リストは${LIST_MAX}店までです。ほかの店を外すと入れられます。`);
      return;
    }
    const n = getList().length;
    announce(r === "added" ? `「${name}」を候補に入れました(${n}店)` : `「${name}」を候補から外しました(${n}店)`);
    if (r === "added") {
      setPop((v) => v + 1);
      if (t.current) clearTimeout(t.current);
    }
  };
  return (
    <button
      type="button"
      className={`cp-heart ${saved ? "is-on" : ""} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? `${name}を候補から外す` : `${name}を候補に入れる`}
      onClick={on}
    >
      <span key={pop} className={pop ? "cp-heart-pop" : ""}>
        <IconHeart size={22} filled={saved} />
      </span>
    </button>
  );
}
