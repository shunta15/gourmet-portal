"use client";

import { useId, useState, type ReactNode } from "react";
import { IconChevronDown } from "../common/Icons";

/**
 * 探すページの左の絞り込み(サイドバー)の入れ物。デスクトップでは常に開いて見え、スマホ・タブレット(1000px 未満)では
 * 「条件で絞り込む」のボタンで開閉する(最初は閉じている)。中身はサーバーで描いた要素をそのまま受け取る。
 * JS が動かないときも、ボタンを押せないだけで中身は CSS で隠れたまま(→ スマホでは検索ボックスから絞れる)。
 */
export default function SideShell({ children, summary }: { children: ReactNode; summary: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside className="vq-side" data-open={open ? "1" : "0"} aria-label="絞り込み">
      <button type="button" className="vq-side-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span>条件で絞り込む</span>
        {summary ? <span className="vq-side-sum">{summary}</span> : null}
        <IconChevronDown className="vq-side-chev" />
      </button>
      <div className="vq-side-body" id={id}>
        {children}
      </div>
    </aside>
  );
}
