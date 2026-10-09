"use client";
/**
 * 「候補に入れる」⇄「候補から外す」。仕組みは今の店ページと同じ（lib/portal/savedList.ts。保存先はこのブラウザの localStorage）。
 * 見た目だけ、朱の「輪」の印を押す形にした。画面の隅の案内（ListEntry）が「入れました（◯店）」を読み上げる。
 */
import { useEffect, useRef, useState } from "react";
import { LIST_MAX, announce, getList, toggleSaved, useIsSaved } from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";

export default function SaveSeal({ id, name, page }: { id: string; name: string; page: string }) {
  const saved = useIsSaved(id);
  const [pop, setPop] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onClick = () => {
    const r = toggleSaved(id);
    if (r === "full") {
      announce(`候補リストは${LIST_MAX}店までです。ほかの店を外すと入れられます。`);
      return;
    }
    const n = getList().length;
    announce(r === "added" ? `「${name}」を候補に入れました（${n}店）` : `「${name}」を候補から外しました（${n}店）`);
    trackTap({ storeId: id, kind: r === "added" ? "save" : "unsave", page });
    if (r === "added") {
      setPop(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPop(false), 700);
    } else setPop(false);
  };

  const verb = saved ? "候補から外す" : "候補に入れる";
  return (
    <button type="button" className="vS-save" aria-pressed={saved} aria-label={`${verb}（${name}）`} data-pop={pop ? "1" : "0"} data-cursor="SAVE" onClick={onClick}>
      <span className="vN-seal" aria-hidden="true">輪</span>
      <span aria-hidden="true">{verb}</span>
    </button>
  );
}
