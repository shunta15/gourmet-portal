"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export interface FooterAreaGroup {
  label: string;
  en: string;
  items: { name: string; href: string }[];
}

/**
 * フッターの「都道府県から探す」。地方ブロックごとに折りたためる（<details>）。
 * HTML では全部開いた状態で出す（JS が無くても・検索エンジンにも全リンクが見える）。
 * スマホ幅のときだけ、表示後に閉じる（フッターが縦に長くなりすぎないように）。
 */
export default function FooterAreas({ groups }: { groups: FooterAreaGroup[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(max-width: 960px)").matches) return;
    root.current?.querySelectorAll("details").forEach((d) => {
      d.open = false;
    });
  }, []);

  return (
    <div className="mp-ft-areas" ref={root}>
      {groups.map((g) => (
        <details key={g.label} open>
          <summary>
            <span>{g.label}</span>
            <small>{g.en}</small>
          </summary>
          <ul>
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} prefetch={false}>
                  {it.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
