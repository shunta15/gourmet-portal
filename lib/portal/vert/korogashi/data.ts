/**
 * 転がし(KOROGASHI)のデータ。サーバー専用（クライアントの部品は型だけを import する）。
 * 種類の名前と slug は lib/verticals/bodycare.ts、件数は店のデータ（lib/places）から、そのつど数える。決め打ちの件数・種類は持たない。
 */
import type { Place } from "@/lib/places/types";
import type { Vertical } from "@/lib/verticals/types";
import { POLE_COLORS } from "./colors";

export { POLE_COLORS };

/** 紙の帯の英字(飾り) */
const EN: Record<string, string> = {
  seitai: "Seitai",
  sekkotsu: "Sekkotsu",
  shinkyu: "Shinkyu",
  massage: "Massage",
  relaxation: "Relaxation",
  stretch: "Stretch",
};

export type KoroKind = { n: number; slug: string; name: string; en: string; href: string; color: string; count: number };

/**
 * 立体のポールの数(山の物理は 6 本ぶんで作ってある)。掲載のある種類だけが名札を持ち、残りは名札のない無地のポールになる。
 */
export const POLE_COUNT = 6;

/**
 * 掲載が 1 件以上ある種類だけを、lib/verticals/bodycare.ts の並びのまま、1 から振り直した番号で返す（0 件の種類は出さない）。
 * 件数の数え方は、行き先のページ（components/portal/pages/data.ts の pick）と同じ。
 */
export function koroKinds(v: Vertical, all: Place[], hrefOf?: (slug: string) => string): KoroKind[] {
  const out: KoroKind[] = [];
  for (const c of v.categories) {
    const count = all.filter((p) => p.category === c.slug).length;
    if (count === 0 || out.length >= POLE_COUNT) continue;
    const i = out.length;
    out.push({ n: i + 1, slug: c.slug, name: c.name, en: EN[c.slug] ?? c.slug, href: hrefOf ? hrefOf(c.slug) : `${v.path}/${c.slug}`, color: POLE_COLORS[i], count });
  }
  return out;
}

/** 最初の画面のリード文。種類の名前と件数は実データから作る（掲載のない種類は書かない）。 */
export function koroLead(kinds: KoroKind[], total: number): string {
  const names = kinds.map((k) => k.name).join("、");
  return `${names}の店を、エリア・種類から探せる入口です。現在の掲載は ${total} 件です。`;
}

/**
 * 下の段の店の写真(2026-10-13 時点で 6 店。写真は分類の表で face が clear でなく・quality 4 以上・text が false のもの)。
 * 使うときは、店の ID が掲載データと完全に一致し、写真のパスがその店の写真一覧にあるものだけ（pickShops）。
 */
export const SHOP_PICKS: { id: string; photo: string }[] = [
  { id: "bo0080", photo: "/_portal/vshops/bodycare-37/g1.jpg" },
  { id: "bo0030", photo: "/_portal/vshops/bodycare-9/s2.jpg" },
  { id: "bo0044", photo: "/_portal/vshops/bodycare-88/s1.jpg" },
  { id: "bo0043", photo: "/_portal/vshops/bodycare-85/s1.jpg" },
  { id: "bo0003", photo: "/_portal/vshops/bodycare-74/s3.jpg" },
  { id: "bo0062", photo: "/_portal/vshops/bodycare-8/s1.jpg" },
];

export const SHOP_COUNT = 6;

export type KoroShop = { id: string; name: string; cityName: string; pref: string; photo: string; what: string; width: number; height: number };

/** 補う写真の決め方: 幅 1000px 以上で、写っているものが屋内の設備（ベッド・施術室・院内・店内・受付・待合・室内）で、人を表す言葉（人・様子・院長・スタッフ）を含まないもの。 */
const FILL_OK = /(ベッド|施術室|院内|店内|受付|待合|室内)/;
const FILL_NG = /(人|様子|院長|スタッフ)/;

/**
 * 下の段に出す店を決める。
 *  1. SHOP_PICKS の順に、ID が完全一致する掲載店を探し、写真のパスがその店の photos にあるものだけ採る（店が無い・写真が無いものは出さない）。
 *  2. 6 店に足りなければ、残りの掲載店を ID の昇順に見て、上の決め方（FILL_OK / FILL_NG・幅 1000px 以上）に合う最初の 1 枚がある店から補う。
 * 写真の説明（what）は、データの値をそのまま alt に使う。
 */
export function pickShops(places: Place[]): KoroShop[] {
  const byId = new Map(places.map((p) => [p.id, p]));
  const out: KoroShop[] = [];
  const used = new Set<string>();
  const add = (p: Place, path: string) => {
    const ph = p.photos?.find((x) => x.path === path);
    if (!ph || !ph.what || !ph.width || !ph.height) return;
    out.push({ id: p.id, name: p.name, cityName: p.cityName ?? "", pref: p.pref, photo: ph.path, what: ph.what, width: ph.width, height: ph.height });
    used.add(p.id);
  };
  for (const pk of SHOP_PICKS) {
    const p = byId.get(pk.id);
    if (p && !used.has(p.id)) add(p, pk.photo);
  }
  if (out.length < SHOP_COUNT) {
    const rest = places.filter((p) => !used.has(p.id)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const p of rest) {
      if (out.length >= SHOP_COUNT) break;
      const ph = p.photos?.find((x) => (x.width ?? 0) >= 1000 && !!x.what && FILL_OK.test(x.what) && !FILL_NG.test(x.what));
      if (ph) add(p, ph.path);
    }
  }
  return out;
}
