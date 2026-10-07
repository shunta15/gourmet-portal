"use client";
/** スマホの下の帯。ファーストビューを過ぎたら、予約・電話・マップの押し所を画面の下に出す（フッターに来たら引っ込める） */
import { useEffect, useState } from "react";
import { SaIcon } from "@/components/portal/ShopActionsParts";
import { trackTap } from "@/lib/portal/track";
import type { IconKey, PrimaryAction } from "@/lib/portal/shopActions";

export default function ShopBar({ items, storeId, page }: { items: Pick<PrimaryAction, "id" | "short" | "href" | "external" | "icon" | "hero" | "tap">[]; storeId: string; page: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".vS-hero");
    const foot = document.querySelector(".vN-ft");
    if (!hero) return;
    let pastHero = false;
    let atFoot = false;
    const upd = () => setOn(pastHero && !atFoot);
    const a = new IntersectionObserver((es) => {
      pastHero = !es[0].isIntersecting;
      upd();
    }, { rootMargin: "-40% 0px 0px 0px" });
    a.observe(hero);
    const b = foot
      ? new IntersectionObserver((es) => {
          atFoot = es[0].isIntersecting;
          upd();
        })
      : null;
    if (foot && b) b.observe(foot);
    return () => {
      a.disconnect();
      b?.disconnect();
    };
  }, []);
  if (items.length === 0) return null;
  return (
    <div className={`vS-bar${on ? " is-on" : ""}`} role="group" aria-label="予約・電話・地図" aria-hidden={!on || undefined}>
      {items.map((a) => (
        <a
          key={a.id}
          href={a.href}
          tabIndex={on ? 0 : -1}
          {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={a.hero ? "is-hero" : undefined}
          onClick={() => {
            if (a.tap) trackTap({ storeId, kind: a.tap, page });
          }}
        >
          <SaIcon name={a.icon as IconKey} size={20} />
          {a.id === "gmap" ? "マップ" : a.short}
        </a>
      ))}
    </div>
  );
}
