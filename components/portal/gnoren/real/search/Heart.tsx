"use client";
/**
 * 札のハート。保存の仕組みは今の候補リスト(lib/portal/savedList.ts。この端末のブラウザに残る。会員登録なし)。
 * 動きとお知らせは components/portal/noren/BlockSearchParts.tsx の BlockHeart と同じ(画面の隅の案内は components/portal/ListEntry.tsx)。
 * 見た目は試作(search/search.css の .gn-search-heart)のまま。
 */
import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "../../common/icons";
import { LIST_MAX, announce, getList, toggleSaved, useIsSaved } from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";

function currentPath(): string {
  try {
    return decodeURI(window.location.pathname);
  } catch {
    return window.location.pathname;
  }
}

export default function Heart({ id, name }: { id: string; name: string }) {
  const saved = useIsSaved(id);
  const [pop, setPop] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const onClick = () => {
    const r = toggleSaved(id);
    if (r === "full") {
      announce(`候補リストは${LIST_MAX}店までです。ほかの店を外すと入れられます。`);
      return;
    }
    const n = getList().length;
    announce(r === "added" ? `「${name}」を候補に入れました(${n}店)` : `「${name}」を候補から外しました(${n}店)`);
    trackTap({ storeId: id, kind: r === "added" ? "save" : "unsave", page: currentPath() });
    if (r === "added") {
      setPop(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPop(false), 600);
    } else setPop(false);
  };
  return (
    <button type="button" className="gn-search-heart" aria-pressed={saved} aria-label={saved ? `${name}を候補から外す` : `${name}を候補に入れる`} data-on={saved ? "1" : "0"} data-pop={pop ? "1" : "0"} data-sv-id={id} onClick={onClick}>
      <span>
        <HeartIcon />
      </span>
    </button>
  );
}
