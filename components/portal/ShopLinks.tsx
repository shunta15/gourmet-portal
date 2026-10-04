"use client";
/**
 * 店のリンクのボタン（電話・地図・予約・公式サイト・SNS）。値がある項目だけが links に入ってくる（lib/portal/sns.ts の shopLinks）。
 * アイコンは自作の線画＋文字ラベル。外部リンクは rel="noopener noreferrer" target="_blank"。
 * タップは lib/portal/track.ts で数える（storeId・kind・page だけ）。
 *
 * variant:
 *  - "portal"  総合サイト（新業種の店ページ）。portal.css の .mp-sl*
 *  - "gourmet" グルメの店ページ（RestaurantDetail の .detail-actions の直下に置く <a> の並び。既存の chip に馴染ませる）
 */
import type { CSSProperties } from "react";
import { trackTap } from "@/lib/portal/track";
import type { ShopLink } from "@/lib/portal/sns";
import { Icon, type IconName } from "./icons";

interface Props {
  links: ShopLink[];
  storeId: string;
  /** 計測用のページのパス */
  page: string;
  variant?: "portal" | "gourmet";
}

const ICON: Record<ShopLink["kind"], IconName> = {
  phone: "phone",
  map: "map",
  reserve: "reserve",
  website: "website",
  instagram: "instagram",
  tiktok: "tiktok",
  x: "x",
  facebook: "facebook",
  line: "line",
};

const CURSOR: Record<ShopLink["kind"], string> = {
  phone: "CALL",
  map: "MAP",
  reserve: "BOOK",
  website: "LINK",
  instagram: "LINK",
  tiktok: "LINK",
  x: "LINK",
  facebook: "LINK",
  line: "LINK",
};

const G_CHIP: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "16px 24px",
  border: "1px solid var(--line)",
  borderRadius: 0,
  color: "var(--ink)",
  textDecoration: "none",
};

const SR_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};

export default function ShopLinks({ links, storeId, page, variant = "portal" }: Props) {
  if (links.length === 0) return null;
  const gourmet = variant === "gourmet";
  const items = links.map((l) => (
    <a
      key={l.kind}
      href={l.href}
      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={gourmet ? "chip" : "mp-sl-b"}
      style={gourmet ? G_CHIP : undefined}
      onClick={() => trackTap({ storeId, kind: l.kind, page })}
      data-cursor={CURSOR[l.kind]}
      data-shop-link={l.kind}
    >
      <Icon name={ICON[l.kind]} />
      {l.label}
      {l.external && (
        <span className={gourmet ? undefined : "mp-sr"} style={gourmet ? SR_STYLE : undefined}>
          （外部サイトが新しいタブで開きます）
        </span>
      )}
    </a>
  ));
  if (gourmet) return <>{items}</>;
  return (
    <ul className="mp-sl">
      {items.map((a, i) => (
        <li key={links[i].kind}>{a}</li>
      ))}
    </ul>
  );
}
