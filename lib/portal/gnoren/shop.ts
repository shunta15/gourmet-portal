/**
 * 店ページ /restaurant/<id>(暖簾2 見本 3)の中身を作る(サーバー専用)。Restaurant → GnShopVM。
 * 設計: components/portal/gnoren/REAL_PLAN.md「### 店(real/shop)」。
 * - 写真は実物だけ(allShopPhotos)。ヒーロー → ギャラリー(最大 5) → おすすめの写真(4 枚そろうときだけ) → 利用シーンの順に使い、足りなければ詰める(空枠を作らない)
 * - 値段は出さない(予算の行・金額を含む項目は除く)。人名・日付・架空の店名は作らない。文はデータの文のみ
 * 'use client' の部品からは import しない(lib/data を読む)。
 */
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { BROAD_GROUPS, broadKeysOf } from "@/lib/cuisineBroad";
import { GEO } from "@/lib/geo";
import { mapsUrlForRestaurant } from "@/lib/maps";
import { regionNameOf, type Restaurant } from "@/lib/regions";
import { SCENES } from "@/lib/scenes";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import { featuresOfShop } from "@/lib/portal/noren/shopFeatures";
import { stripTabelogScore, stripTabelogScoreList } from "@/lib/portal/noren/tabelogScore";
import { sized } from "@/lib/imageUrl";
import { allShopPhotos, featureHref, imgProps, isPriceSpec, paragraphs } from "@/components/portal/gnoren/real/common";

export type GnImg = { src: string; srcSet?: string; sizes?: string };

export type GnShopVM = {
  id: string;
  name: string;
  /** 店名の字数(暖簾・見出しの字の大きさを決める) */
  nameLen: number;
  cuisine?: string;
  area?: string;
  nearest?: string;
  /** ヒーローの写真。無ければ暖簾の布だけ */
  hero?: GnImg;
  /** 縦の短冊(0〜3) */
  strips: string[];
  tags: Array<{ label: string; kind: "cuisine" | "region" | "scene" }>;
  /** 紹介文(段落) */
  desc: string[];
  /** この店のおすすめ(最大 4。写真は 4 枚そろうときだけ全部に付く) */
  picks: Array<{ name: string; desc?: string; img?: GnImg; alt?: string }>;
  /** ギャラリー(0〜5。0 なら節を出さない) */
  gallery: Array<{ thumb: GnImg; full: string; alt: string }>;
  /** 利用シーン(0〜4) */
  scenes: Array<{ slug: string; name: string; sub: string; href: string; img?: GnImg }>;
  /** 店舗情報(あるものだけ) */
  info: Array<{ key: "addr" | "hours" | "closed" | "tel" | "seats" | "access"; label: string; text: string; tel?: string }>;
  address?: string;
  mapsUrl?: string;
  geo?: { lat: number; lng: number };
  /** 対の特集記事(あれば「この店の特集記事を読む」) */
  feature?: { id: string; href: string; title: string };
  /** 関連記事(対の記事が先頭。最大 3) */
  related: Array<{ id: string; href: string; title: string; sub?: string; img?: GnImg; paired: boolean }>;
};

const clean = (s: string | undefined | null): string => (s ?? "").replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
/** 「—」「-」「要確認」など中身の無い値は無いものとして扱う */
const hasValue = (s: string): boolean => s.length > 0 && !/^[-－ー—–・\s]+$/.test(s) && !/^(要確認|不明|なし|未定)$/.test(s);
const MONEY = /[¥￥円]|予算|料金|価格/;
/** 「おすすめ」に使わない語(順位・他サイトの評価・口コミ・星・その他。本文の文は紹介文にそのまま出るが、新しく取り出す項目には使わない) */
const PICK_BAN = /No\.?\s?1|ナンバー|口コミ|レビュー|評価|ミシュラン|[★☆]|[一二三]つ星|その他/;

function sentences(text: string): string[] {
  const out: string[] = [];
  for (const block of (text ?? "").split(/(?:\\n|\n)+/)) {
    for (const s of block.split(/(?<=[。！？])(?![」』）])/)) {
      const t = s.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

const trimEnd = (s: string) => s.replace(/[。、，,\s]+$/g, "");

/** 短冊に入れる短い句。14 字以内ならそのまま、長ければ最初の句(、・× などの前)が 4〜14 字のときだけそれを使う。使えなければ undefined */
function stripPhrase(text: string): string | undefined {
  const t = trimEnd(text);
  if (t.length === 0) return undefined;
  if (t.length <= 14) return t;
  const first = t.split(/[、，,・×／/（(「]/)[0].trim();
  if (first.length >= 4 && first.length <= 14) return first;
  return undefined;
}

/** 文の先頭の句を「名前」にし、残りを説明にする。句が 4〜18 字でなければ名前は付けず、文を説明にする */
function splitNameDesc(sentence: string): { name: string; desc?: string } {
  const s = sentence.trim();
  const m = /^(.{4,18}?)[、，,]/.exec(s);
  if (m) {
    const rest = s.slice(m[0].length).trim();
    if (rest.length >= 6) return { name: m[1], desc: rest };
  }
  return { name: "", desc: s };
}

export async function buildShopPage(r: Restaurant): Promise<GnShopVM> {
  const descText = clean(stripTabelogScore(r.desc ?? ""));
  const desc = paragraphs(stripTabelogScore(r.desc ?? "") ?? "", 90).map(clean).filter(Boolean);
  const body = stripTabelogScoreList(r.body ?? []).map(clean).filter(Boolean);
  const highlights = stripTabelogScoreList(r.highlights ?? []).map(clean).filter(Boolean);

  // 写真
  const photos = allShopPhotos(r);
  const heroSrc = photos[0];
  const rest = photos.slice(1);
  const galleryPhotos = rest.slice(0, 5);
  let afterGallery = rest.slice(5);

  // 短冊 3(highlights の先頭 3。短い句にできるものだけ。1 本も取れなければ desc の文から)。長くて短い句にできないものは飛ばす
  const strips: string[] = [];
  const stripUsed = new Set<string>();
  const takeStrips = (src: string[]) => {
    for (const t of src) {
      const p = stripPhrase(t);
      if (!p || MONEY.test(p) || PICK_BAN.test(p) || strips.includes(p)) continue;
      strips.push(p);
      stripUsed.add(t);
      if (strips.length === 3) break;
    }
  };
  takeStrips(highlights.slice(0, 3));
  if (strips.length === 0) takeStrips(sentences(descText));

  // この店のおすすめ 4: 短冊に使わなかった highlights → body の段落 → 短冊に使った highlights → desc の文
  const cand: Array<{ name: string; desc?: string }> = [];
  const seen = new Set<string>();
  const push = (name: string, d?: string) => {
    const key = `${name}|${d ?? ""}`;
    const all = `${name}${d ?? ""}`;
    if (!all || seen.has(key) || MONEY.test(all) || PICK_BAN.test(all) || isPriceSpec(name)) return;
    seen.add(key);
    cand.push({ name, desc: d });
  };
  for (const h of highlights) if (!stripUsed.has(h)) push(h);
  for (const p of body) {
    const s = sentences(p)[0];
    if (s) {
      const nd = splitNameDesc(s);
      push(nd.name, nd.desc);
    }
  }
  for (const h of highlights) if (stripUsed.has(h)) push(h);
  for (const s of sentences(descText)) {
    const nd = splitNameDesc(s);
    push(nd.name, nd.desc);
  }
  const pickBase = cand.slice(0, 4);
  // 写真は、おすすめの全項目に付けられるときだけ付ける(一部だけ付けると空枠に見える)
  const picksPhotos = pickBase.length > 0 && afterGallery.length >= pickBase.length ? afterGallery.slice(0, pickBase.length) : [];
  if (picksPhotos.length > 0) afterGallery = afterGallery.slice(picksPhotos.length);
  const picks = pickBase.map((p, i) => ({
    ...p,
    ...(picksPhotos[i] ? { img: imgProps(picksPhotos[i], 480), alt: p.name || r.name } : {}),
  }));

  // 利用シーン: 店のタグに合うシーン(最大 4)。残りの写真を順に添える(無ければ文だけ)
  const scenes = SCENES.filter((s) => shopInScene(s.matchTags, r.tags))
    .slice(0, 4)
    .map((s, i) => ({
      slug: s.slug,
      name: s.name,
      sub: s.tagline,
      href: `/search?scene=${s.slug}`,
      ...(afterGallery[i] ? { img: imgProps(afterGallery[i], 640) } : {}),
    }));

  // タグ 3(料理分類・地域・シーン 1 つ)
  const tags: GnShopVM["tags"] = [];
  const bk = broadKeysOf({ id: r.id, cuisine: r.cuisine });
  const broad = BROAD_GROUPS.find((g) => bk.includes(g.key));
  const cuisineLabel = broad?.label ?? (clean(r.cuisine).length > 0 && clean(r.cuisine).length <= 10 ? clean(r.cuisine) : "");
  if (cuisineLabel) tags.push({ label: cuisineLabel, kind: "cuisine" });
  const regionLabel = regionNameOf(r.region);
  if (regionLabel) tags.push({ label: regionLabel, kind: "region" });
  if (scenes[0]) tags.push({ label: scenes[0].name, kind: "scene" });

  // 店舗情報(あるものだけ。予算・禁煙は出さない)
  const info: GnShopVM["info"] = [];
  const address = clean(r.address);
  const phone = clean(r.phone);
  const rows: Array<[GnShopVM["info"][number]["key"], string, string]> = [
    ["addr", "住所", address],
    ["hours", "営業時間", clean(r.hours)],
    ["closed", "定休日", clean(r.closed)],
    ["tel", "電話番号", phone],
    ["seats", "席数", clean(r.seats)],
    ["access", "アクセス", clean(r.nearest)],
  ];
  for (const [key, label, text] of rows) {
    if (!hasValue(text)) continue;
    info.push({ key, label, text, ...(key === "tel" ? { tel: text.replace(/[^\d+]/g, "") } : {}) });
  }

  const geo = GEO[r.id];

  // 対の記事(ARTICLE_STORE_ID_BY_FEATURE の逆引き。完全一致)と関連記事
  const pairedId = Object.entries(ARTICLE_STORE_ID_BY_FEATURE).find(([, sid]) => sid === r.id)?.[0];
  const feats = await featuresOfShop(r.id, pairedId, 3);
  const related = feats.map((f) => ({
    id: f.id,
    href: featureHref(f.id),
    title: f.title,
    sub: clean(f.sub) || undefined,
    ...(f.image ? { img: imgProps(f.image, 640) } : {}),
    paired: f.paired,
  }));
  const pairedFeat = related.find((f) => f.paired);

  return {
    id: r.id,
    name: r.name,
    nameLen: Array.from(r.name).length,
    cuisine: hasValue(clean(r.cuisine)) ? clean(r.cuisine) : undefined,
    area: hasValue(clean(r.area)) ? clean(r.area) : undefined,
    nearest: hasValue(clean(r.nearest)) ? clean(r.nearest) : undefined,
    ...(heroSrc ? { hero: imgProps(heroSrc, 1800, "100vw") } : {}),
    strips,
    tags,
    desc,
    picks,
    gallery: galleryPhotos.map((u, i) => ({ thumb: imgProps(u, 800, "(max-width: 768px) 50vw, 400px"), full: sized(u, 1600), alt: `${r.name} の写真 ${i + 1}` })),
    scenes,
    info,
    address: address || undefined,
    mapsUrl: address || r.area ? mapsUrlForRestaurant(r) : undefined,
    ...(geo ? { geo: { lat: geo.lat, lng: geo.lng } } : {}),
    ...(pairedFeat ? { feature: { id: pairedFeat.id, href: pairedFeat.href, title: pairedFeat.title } } : {}),
    related,
  };
}
