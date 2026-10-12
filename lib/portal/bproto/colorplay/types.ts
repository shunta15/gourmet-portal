/** COLOR PLAY(ビューティーの見本)で、サーバーからクライアントへ渡す形 */
export type CpPhoto = { src: string; alt: string };

export type CpShop = {
  id: string;
  name: string;
  kind: string;
  kindName: string;
  pref: string;
  prefName: string;
  city: string;
  address: string;
  /** 説明の最初の 1 文 */
  blurb: string;
  main: CpPhoto | null;
  subs: CpPhoto[];
  tags: string[];
};

export type CpFeature = { id: string; title: string; store: string; href: string; photo: CpPhoto | null };

export const BASE = "/proto-beauty/colorplay";
export const KIND_SHORT: Record<string, string> = {
  hair: "ヘアサロン",
  nail: "ネイル",
  eyelash: "まつげ・眉",
  esthetic: "エステ",
  "hair-removal": "脱毛",
  headspa: "ヘッドスパ",
};

export type Filters = { kind?: string; pref?: string; q?: string; tag?: string; sort?: string; n?: number };

/** 検索画面の URL(空の項目は付けない) */
export function searchHref(f: Filters): string {
  const p = new URLSearchParams();
  if (f.kind) p.set("kind", f.kind);
  if (f.pref) p.set("pref", f.pref);
  if (f.q) p.set("q", f.q);
  if (f.tag) p.set("tag", f.tag);
  if (f.sort && f.sort !== "area") p.set("sort", f.sort);
  if (f.n && f.n > 20) p.set("n", String(f.n));
  const s = p.toString();
  return `${BASE}/search${s ? `?${s}` : ""}`;
}
