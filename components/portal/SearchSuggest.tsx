"use client";
/**
 * 検索の候補リスト（listbox）。入力欄の combobox（useSiteSearch）と対で使う。
 * 候補はフォーカスを受けない（aria-activedescendant で入力欄から指す）。マウス・タップで選ぶときに入力欄のフォーカスが
 * 外れて候補が消えないよう、押した瞬間（mousedown）の既定動作を止めて、クリックで移動する。
 */
import { KIND_LABEL } from "@/lib/portal/searchCore";
import type { UseSiteSearch } from "./useSiteSearch";

export default function SearchSuggest({ s, className }: { s: UseSiteSearch; className?: string }) {
  return (
    <>
      {/* 候補の件数などを読み上げる（見えない） */}
      <div className="mp-sr" role="status" aria-live="polite">
        {s.announce}
      </div>
      {s.showList && (
        <ul
          id={s.listId}
          role="listbox"
          aria-label="検索候補"
          className={className ? `mp-sug ${className}` : "mp-sug"}
          onMouseDown={(e) => e.preventDefault()}
        >
          {s.rows.map((row, i) => (
            <li
              key={`${row.kind}:${row.href}`}
              id={s.optionId(i)}
              role="option"
              aria-selected={i === s.active}
              className={`${row.kind === "all" ? "all " : ""}${i === s.active ? "on" : ""}`.trim() || undefined}
              data-kind={row.kind}
              data-href={row.href}
              onClick={() => s.go(row)}
            >
              {row.kind !== "all" && <span className="k">{KIND_LABEL[row.kind]}</span>}
              <span className="n">{row.name}</span>
              {row.sub && <span className="s">{row.sub}</span>}
              {row.kind === "all" && <span className="a" aria-hidden="true">→</span>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
