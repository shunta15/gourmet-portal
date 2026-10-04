/**
 * 店ページの「行動ボタン」（components/portal/ShopActions.tsx）が使う、店の事実 → ボタンの一覧に直す純関数。
 * サーバー・クライアントのどちらからも使える（店データは読まない。値は呼び出し側が渡す）。
 *
 * 守ること（proto-portal/SNS-BUTTONS-BRIEF.md）:
 *  - ボタンに出すのは店データにある値だけ。値の無い項目は出さない。フォロワー数・評価・星は扱わない。
 *  - SNS の @アカウント名は URL から取り出す。取れなければ出さない（推測しない）。
 *  - 予約・Google マップ・SNS は https?:// の URL だけ、電話は数字が 6 桁以上あるときだけ。
 */
import { parseTown } from "@/lib/towns";
import { SOCIAL_LABEL, httpUrl, telHref, type ShopLink, type SocialKind } from "./sns";
import type { TapKind } from "./track";

export interface ShopFacts {
  name: string;
  phone?: string;
  reservationUrl?: string;
  address?: string;
  /** エリア名（Google 検索の語に使う） */
  area?: string;
  /** Google マップのリンク（lib/maps.ts の mapsUrlForRestaurant） */
  mapsUrl?: string;
  /** 座標があればページ内の #map へ誘導する */
  geo?: { lat: number; lng: number } | null;
  /** 値がある SNS・公式サイトだけ（lib/portal/shopSocial.ts） */
  social: ShopLink[];
  /** 評価の欄があるとき true（あるとき出典リンクは出さない。今のページと同じ条件） */
  hasRating?: boolean;
  source?: { label: string; url: string } | null;
  featureId?: string;
  town?: { name: string; href: string; count: number } | null;
  region: { name: string; href: string };
}

export type PrimaryId = "reserve" | "phone" | "gmap" | "map" | SocialKind;
export type IconKey =
  | "reserve"
  | "phone"
  | "pin"
  | "map"
  | "instagram"
  | "tiktok"
  | "x"
  | "facebook"
  | "line"
  | "website"
  | "link"
  | "copy"
  | "check"
  | "search";

export interface PrimaryAction {
  id: PrimaryId;
  /** 分類（案1の左の小さな字） */
  cat: string;
  label: string;
  /** 案2・案3の下に出す短いラベル */
  short: string;
  /** 補足（ドメイン・電話番号・住所の先頭・@アカウント名） */
  note?: string;
  /** 案2の円の外周を回る字（ASCII だけ） */
  ring: string;
  href: string;
  external: boolean;
  tap?: TapKind;
  icon: IconKey;
  cursor: string;
  /** 予約または電話の最初の1つ（朱の主役） */
  hero: boolean;
  /** 地図タイル（案3）に添える座標 */
  coord?: string;
}

export interface SecondaryAction {
  id: "search" | "source" | "feature" | "town" | "region";
  label: string;
  href: string;
  external: boolean;
  cursor: string;
}

export interface ActionModel {
  primary: PrimaryAction[];
  secondary: SecondaryAction[];
}

const SNS_ORDER: SocialKind[] = ["instagram", "tiktok", "x", "facebook", "line", "website"];

const RESERVED: Partial<Record<SocialKind, string[]>> = {
  instagram: ["p", "reel", "reels", "explore", "accounts", "stories", "tv", "direct", "about", "developer", "legal"],
  x: ["intent", "i", "home", "share", "search", "hashtag", "explore", "login", "settings", "messages", "notifications", "compose"],
  facebook: [
    "profile.php",
    "pages",
    "people",
    "groups",
    "share",
    "sharer",
    "sharer.php",
    "p",
    "pg",
    "watch",
    "events",
    "photo",
    "photos",
    "permalink.php",
    "login",
    "plugins",
    "dialog",
  ],
};

/** 同じ行き先かどうかの比較用（ホスト＋パス。www・末尾スラッシュ・クエリ・ハッシュは無視） */
function sameTarget(a: string, b: string): boolean {
  const norm = (h: string) => {
    try {
      const u = new URL(h);
      return `${u.hostname.replace(/^www\./i, "").toLowerCase()}${u.pathname.replace(/\/+$/, "")}`;
    } catch {
      return h;
    }
  };
  return norm(a) === norm(b);
}

export function hostOf(href: string): string | null {
  try {
    return new URL(href).hostname.replace(/^www\./i, "") || null;
  } catch {
    return null;
  }
}

/** URL から @アカウント名を取り出す（取れなければ undefined）。公式サイトは @ ではなくドメインを返す */
export function handleOf(kind: SocialKind, href: string): string | undefined {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return undefined;
  }
  const segs = u.pathname
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  const first = segs[0];
  switch (kind) {
    case "instagram":
      if (first && /^[A-Za-z0-9._]{1,30}$/.test(first) && !RESERVED.instagram!.includes(first.toLowerCase())) return `@${first}`;
      return undefined;
    case "x":
      if (first && /^[A-Za-z0-9_]{1,15}$/.test(first) && !RESERVED.x!.includes(first.toLowerCase())) return `@${first}`;
      return undefined;
    case "tiktok":
      if (first && /^@[A-Za-z0-9._]{1,24}$/.test(first)) return first;
      return undefined;
    case "facebook":
      if (
        first &&
        /^[A-Za-z0-9.\-]{5,50}$/.test(first) &&
        !/^\d+$/.test(first) &&
        !RESERVED.facebook!.includes(first.toLowerCase())
      )
        return `@${first}`;
      return undefined;
    case "line": {
      const at = segs.find((s) => /^@[A-Za-z0-9._\-]{2,40}$/.test(s));
      if (at) return at;
      if (/^page\.line\.me$/i.test(u.hostname) && first && /^[A-Za-z0-9._\-]{2,40}$/.test(first)) return `@${first}`;
      return undefined;
    }
    case "website":
      return hostOf(href) ?? undefined;
  }
}

/** 住所の先頭〜市区町村まで（住所の文字列の先頭部分をそのまま切り出す。取れなければ undefined） */
export function addressHead(address: string | undefined): string | undefined {
  const a = (address ?? "").trim();
  if (!a) return undefined;
  const p = parseTown(a);
  if (!p) return undefined;
  const i = a.indexOf(p.town);
  if (i < 0) return undefined;
  return a.slice(0, i + p.town.length);
}

/** 座標を小さく添える表記（小数3桁＝約100m。地図ピンの概略であって、番地の精度ではない） */
export function coordText(g: { lat: number; lng: number }): string {
  const ns = g.lat >= 0 ? "N" : "S";
  const ew = g.lng >= 0 ? "E" : "W";
  return `${Math.abs(g.lat).toFixed(3)}°${ns}  ${Math.abs(g.lng).toFixed(3)}°${ew}`;
}

const ICON_OF: Record<SocialKind, IconKey> = {
  instagram: "instagram",
  tiktok: "tiktok",
  x: "x",
  facebook: "facebook",
  line: "line",
  website: "website",
};

/** 円の外周に回す字の上限（長いアカウント名は外周だけ切る。補足の文字には全文が出る） */
function ringHandle(h: string): string {
  return h.length > 22 ? `${h.slice(0, 21)}…` : h;
}

export function buildActionModel(shop: ShopFacts): ActionModel {
  const primary: PrimaryAction[] = [];

  const res = httpUrl(shop.reservationUrl);
  if (res) {
    const host = hostOf(res) ?? undefined;
    primary.push({
      id: "reserve",
      cat: "予約",
      label: "予約する",
      short: "予約する",
      note: host,
      ring: host ? `RESERVE · ${host} · ` : "RESERVE · ",
      href: res,
      external: true,
      tap: "reserve",
      icon: "reserve",
      cursor: "BOOK",
      hero: false,
    });
  }

  const tel = telHref(shop.phone);
  if (tel) {
    const num = (shop.phone ?? "").trim();
    primary.push({
      id: "phone",
      cat: "電話",
      label: "電話する",
      short: "電話する",
      note: num,
      ring: `TEL · ${num.replace(/[^\d+\-() ]/g, "")} · `,
      href: tel,
      external: false,
      tap: "phone",
      icon: "phone",
      cursor: "CALL",
      hero: false,
    });
  }

  const mapsUrl = httpUrl(shop.mapsUrl);
  if (mapsUrl && (shop.address ?? "").trim()) {
    const head = addressHead(shop.address);
    primary.push({
      id: "gmap",
      cat: "地図",
      label: "Google マップで開く",
      short: "Google マップ",
      note: head,
      ring: "GOOGLE MAPS · ",
      href: mapsUrl,
      external: true,
      tap: "map",
      icon: "pin",
      cursor: "MAP",
      hero: false,
    });
  }

  if (shop.geo) {
    const c = coordText(shop.geo);
    primary.push({
      id: "map",
      cat: "地図",
      label: "地図を見る",
      short: "地図を見る",
      ring: `MAP · ${c.replace(/\s+/g, " ")} · `,
      href: "#map",
      external: false,
      icon: "map",
      cursor: "MAP",
      hero: false,
      coord: c,
    });
  }

  const byKind = new Map(shop.social.map((l) => [l.kind, l]));
  for (const k of SNS_ORDER) {
    const l = byKind.get(k);
    if (!l) continue;
    const handle = handleOf(k, l.href);
    primary.push({
      id: k,
      cat: k === "website" ? "公式" : "SNS",
      label: SOCIAL_LABEL[k],
      short: SOCIAL_LABEL[k],
      note: handle,
      ring:
        k === "website"
          ? `WEB · ${handle ?? ""} · `
          : `${SOCIAL_LABEL[k].toUpperCase()} · ${handle ? ringHandle(handle) : ""} · `,
      href: l.href,
      external: l.external,
      tap: k,
      icon: ICON_OF[k],
      cursor: "LINK",
      hero: false,
    });
  }

  const heroIdx = primary.findIndex((p) => p.id === "reserve" || p.id === "phone");
  if (heroIdx >= 0) primary[heroIdx].hero = true;

  const secondary: SecondaryAction[] = [];
  if (!shop.phone && !shop.reservationUrl) {
    secondary.push({
      id: "search",
      label: "Googleで詳細を調べる",
      href: `https://www.google.com/search?q=${encodeURIComponent(`${shop.name} ${shop.area ?? ""} 予約 営業時間`)}`,
      external: true,
      cursor: "LINK",
    });
  }
  // 出典リンクは、同じ行き先のボタン（SNS・予約・Google マップ）がすでにあるときは出さない（Instagram が二重に出ない）
  if (shop.source && !shop.hasRating && !primary.some((p) => sameTarget(p.href, shop.source!.url))) {
    secondary.push({ id: "source", label: shop.source.label, href: shop.source.url, external: true, cursor: "LINK" });
  }
  if (shop.featureId) {
    secondary.push({
      id: "feature",
      label: "この店の特集記事を読む",
      href: `/feature/${encodeURIComponent(shop.featureId)}`,
      external: false,
      cursor: "READ",
    });
  }
  if (shop.town && shop.town.count > 1) {
    secondary.push({
      id: "town",
      label: `${shop.town.name}の他の店を見る（${shop.town.count - 1}店）`,
      href: shop.town.href,
      external: false,
      cursor: "ENTER",
    });
  }
  secondary.push({
    id: "region",
    label: `${shop.region.name}の他の店を見る`,
    href: shop.region.href,
    external: false,
    cursor: "ENTER",
  });

  return { primary, secondary };
}
