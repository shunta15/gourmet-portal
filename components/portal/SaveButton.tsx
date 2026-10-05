"use client";
/**
 * 店の「候補に入れる」⇄「候補から外す」ボタン（候補リスト。仕組みは lib/portal/savedList.ts）。
 * 公開スイッチ ON のときだけ出る（グルメの店ページは React.lazy で読む。総合サイトの店カードはそのページだけ）。
 * 保存先はブラウザの localStorage。会員登録なし。押すと状態が変わり（aria-pressed・塗りつぶし・チェック）、
 * 画面の隅の案内（components/portal/ListEntry.tsx）で「入れました（◯店）」を読み上げる。50 店までで、超えるときは理由を出す。
 *
 * variant:
 *  - "card"   店カードの写真の隅に重ねるアイコンだけのボタン（親に .sv-host を付ける。名前は aria-label）
 *  - "hero"   グルメの店ページの写真の上（店名の下）
 *  - "inline" 総合サイトの紙の上（/list の共有されたリストの 1 店ずつ）
 */
import { useEffect, useRef, useState } from "react";
import { LIST_MAX, announce, getList, toggleSaved, useIsSaved } from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";
import { CSS_BASE } from "./saveListCss";
import { SaveIcon } from "./SaveIcon";

function currentPath(): string {
  try {
    return decodeURI(window.location.pathname);
  } catch {
    return window.location.pathname;
  }
}

export default function SaveButton({
  id,
  name,
  variant = "card",
  page,
}: {
  id: string;
  name: string;
  variant?: "card" | "hero" | "inline";
  /** 計測用のページのパス。省略すると、いま開いているページのパス（クエリなし。日本語は読める形に戻す） */
  page?: string;
}) {
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
    announce(r === "added" ? `「${name}」を候補に入れました（${n}店）` : `「${name}」を候補から外しました（${n}店）`);
    trackTap({ storeId: id, kind: r === "added" ? "save" : "unsave", page: page ?? currentPath() });
    if (r === "added") {
      setPop(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPop(false), 600);
    } else {
      setPop(false);
    }
  };

  const verb = saved ? "候補から外す" : "候補に入れる";
  const iconSize = variant === "card" ? 20 : 21;
  return (
    <>
      <style href="sv-base" precedence="sv">
        {CSS_BASE}
      </style>
      <button
        type="button"
        className={`sv-b sv-${variant}`}
        aria-pressed={saved}
        aria-label={`${verb}（${name}）`}
        data-pop={pop ? "1" : "0"}
        data-cursor="SAVE"
        data-sv-id={id}
        onClick={onClick}
      >
        {variant === "card" ? (
          <span className="sv-disc">
            <SaveIcon size={iconSize} />
          </span>
        ) : (
          <>
            <SaveIcon size={iconSize} />
            <span className="sv-t" aria-hidden="true">
              {verb}
            </span>
          </>
        )}
      </button>
    </>
  );
}
