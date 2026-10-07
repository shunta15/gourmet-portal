/**
 * 店ページの「行動ボタン」（components/portal/ShopActions.tsx）が使う、店の事実 → ボタンの一覧に直す純関数。
 * サーバー・クライアントのどちらからも使える（店データは読まない。値は呼び出し側が渡す）。
 *
 * 守ること（proto-portal/SNS-BUTTONS-BRIEF-2.md）:
 *  - ボタンに出すのは店データにある値だけ。値の無い項目は出さない。フォロワー数・評価・星は扱わない。
 *  - 予約・Google マップ・SNS は https?:// の URL だけ、電話は数字が 6 桁以上あるときだけ。
 *  - ボタンはアイコンと短いラベルだけ（@アカウント名・電話番号・ドメイン・住所・座標の補足は出さない）。
 */
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
  | "check";

export interface PrimaryAction {
  id: PrimaryId;
  /** ボタンに見えるラベル（短い） */
  short: string;
  href: string;
  external: boolean;
  tap?: TapKind;
  icon: IconKey;
  /** 予約または電話の最初の1つ（朱の主役） */
  hero: boolean;
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

const ICON_OF: Record<SocialKind, IconKey> = {
  instagram: "instagram",
  tiktok: "tiktok",
  x: "x",
  facebook: "facebook",
  line: "line",
  website: "website",
};

export function buildActionModel(shop: ShopFacts): ActionModel {
  const primary: PrimaryAction[] = [];

  const res = httpUrl(shop.reservationUrl);
  if (res) {
    primary.push({ id: "reserve", short: "予約する", href: res, external: true, tap: "reserve", icon: "reserve", hero: false });
  }

  const tel = telHref(shop.phone);
  if (tel) {
    primary.push({ id: "phone", short: "電話する", href: tel, external: false, tap: "phone", icon: "phone", hero: false });
  }

  const mapsUrl = httpUrl(shop.mapsUrl);
  if (mapsUrl && (shop.address ?? "").trim()) {
    primary.push({ id: "gmap", short: "Google マップ", href: mapsUrl, external: true, tap: "map", icon: "pin", hero: false });
  }

  if (shop.geo) {
    primary.push({ id: "map", short: "地図を見る", href: "#map", external: false, icon: "map", hero: false });
  }

  const byKind = new Map(shop.social.map((l) => [l.kind, l]));
  for (const k of SNS_ORDER) {
    const l = byKind.get(k);
    if (!l) continue;
    primary.push({ id: k, short: SOCIAL_LABEL[k], href: l.href, external: l.external, tap: k, icon: ICON_OF[k], hero: false });
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
