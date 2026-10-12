"use client";
/**
 * 店のリンクのボタン(COLOR PLAY 版)。値がある項目だけが links に入ってくる(lib/portal/sns.ts の shopLinks)。
 * 外部リンクは rel="noopener noreferrer" target="_blank"。タップは lib/portal/track.ts で数える(storeId・kind・page だけ)。
 * variant: "primary" 赤い大きなボタン 1 つ / "row" 輪郭の丸いボタンの並び
 */
import { trackTap } from "@/lib/portal/track";
import type { ShopLink } from "@/lib/portal/sns";

const PRIMARY_LABEL: Partial<Record<ShopLink["kind"], string>> = { reserve: "予約ページを見る", website: "公式サイトを見る", map: "地図で見る" };

export default function CpLinks({ links, storeId, page, variant }: { links: ShopLink[]; storeId: string; page: string; variant: "primary" | "row" }) {
  if (links.length === 0) return null;
  const item = (l: ShopLink, cls: string, arrow: boolean, label = l.label) => (
    <a
      key={l.kind}
      className={cls}
      href={l.href}
      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => trackTap({ storeId, kind: l.kind, page })}
    >
      {label}
      {arrow && <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>}
      {l.external && <span className="cp-sr">(別のタブで開きます)</span>}
    </a>
  );
  if (variant === "primary") return item(links[0], "cp-red", true, PRIMARY_LABEL[links[0].kind] ?? links[0].label);
  return <div className="cp-links">{links.map((l) => item(l, "cp-line-link", false))}</div>;
}
