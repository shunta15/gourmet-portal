import "server-only";
import { SCENE_FEATURE_META } from "@/lib/sceneFeatures";
import { REGIONS } from "@/lib/regions";
import { getFeatureRegions } from "@/lib/featureRegions";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import type { FeatureCardItem } from "@/lib/portal/noren/featureCard";
import { getRoundupGroups, toCardItem } from "@/lib/portal/noren/featureList";
import type { Feature } from "@/lib/regions";

/** 特集の一覧（写真が主役の形）の札 1 枚。写真・題・地域（と一言）。行き先は記事ページ（LIVE_LINKS.feature = 特集記事のリンク先を作っている関数） */
export type RpCard = {
  id: string;
  href: string;
  img: string;
  /** 題（特集記事は店名） */
  title: string;
  /** 題の下の一言（特集記事は記事の題。それ以外は無し） */
  sub: string;
  /** 地域・業種・利用シーンなど（小さく） */
  line: string;
};

/** まとめ記事の札: 地域は、利用シーンの記事なら記事の地域の言い方、それ以外は記事の地域（lib/featureRegions）の最初の 1 つ */
function toRoundupCard(c: FeatureCardItem): RpCard {
  const meta = SCENE_FEATURE_META[c.id];
  let area = meta?.areaLabel ?? "";
  if (!area) {
    const k = getFeatureRegions(c.id)[0];
    area = k ? (REGIONS[k]?.name ?? "") : "";
  }
  return { id: c.id, href: LIVE_LINKS.feature(c.id), img: c.img, title: c.title, sub: "", line: [area, c.tag].filter(Boolean).join("　") };
}

/** 任意の特集（絞り込みの結果）の札 */
export function toListCard(f: Feature): RpCard {
  return toRoundupCard(toCardItem(f));
}

export type RpShelves = {
  scene: RpCard[];
  walk: RpCard[];
  /** シーン別まとめ記事 + 街歩き・コース の本数（変更前の「まとめ記事」の本数と同じ） */
  roundupTotal: number;
};

/**
 * 2 つの棚の札: シーン別まとめ記事 → 街歩き・コース（どちらも lib/data の FEATURES の並び）。
 * 【2026-10-24 オーナー決定「各業種 4 ページに収める」】店 1 軒の記事（旧「特集記事」の棚の 50 枚）は /feature に並べない。店は「店舗紹介」（/restaurant）にいる。
 */
export function getRoundupShelves(): RpShelves {
  const g = getRoundupGroups();
  return {
    scene: g.scene.map(toRoundupCard),
    walk: g.walk.map(toRoundupCard),
    roundupTotal: g.total,
  };
}
