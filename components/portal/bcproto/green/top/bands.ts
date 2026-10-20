import { specialHref } from "../common/site";
import { specialBySlug, type SpecialSlug } from "@/lib/portal/vert/bodygreen/special";

/**
 * 最初のページ下段の「特集記事」3 つの帯の行き先と題。記事そのものは W4(app/bodycare/(sub)/special/[slug])が作る。
 * 題は記事の台帳(lib/portal/vert/bodygreen/special.ts)をそのまま使う(記事の題とずれない)。
 * 帯の画像(banner1〜3)は見本から切り出した飾り。左から 1 = 明るい緑、2 = 淡い桃、3 = 茶の机。
 */
export const bandTitle = (slug: SpecialSlug): string => specialBySlug(slug)?.title ?? "";

export const SPECIAL_BANDS = {
  /** 帯 1「はじめての方へ」 */
  difference: { href: specialHref("difference") },
  /** 帯 2: 土日も開いている店 */
  weekend: { href: specialHref("weekend") },
  /** 帯 3: 店を選ぶときに見るところ */
  choose: { href: specialHref("choose") },
} as const;
