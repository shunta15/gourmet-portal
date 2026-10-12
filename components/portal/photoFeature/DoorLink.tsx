"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { nameCore, nameTokens } from "@/lib/portal/noren/shop";

/**
 * 「店ページを見る」を、暖簾をくぐって店に入る導線として見せる。短い藍の布 3 枚（店の屋号の字を染め抜く）が竿に掛かり、その下に札。
 * 触れると布が揺れて少し分かれ、押すと布が上がって（その間に）店ページへ移る。JavaScript が動かなくても、ふつうのリンクとして押せる。
 * 動きを減らす設定のときは、布を上げずにそのまま移る。
 */
export default function DoorLink({ href, name }: { href: string; name: string }) {
  const router = useRouter();
  const a = useRef<HTMLAnchorElement>(null);
  const chars = nameTokens(nameCore(name)).slice(0, 3);
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    a.current?.classList.add("is-go");
    window.setTimeout(() => router.push(href), 620);
  };
  return (
    <a ref={a} href={href} className="pf-door pf-mag" onClick={onClick}>
      <i className="pf-door__rod" aria-hidden="true" />
      <span className="pf-door__cl" aria-hidden="true">
        {chars.map((c, i) => (
          <b key={i} className="pf-door__p" style={{ "--i": i } as React.CSSProperties}>
            <em>{c}</em>
          </b>
        ))}
      </span>
      <span className="pf-door__t">店ページを見る →</span>
    </a>
  );
}
