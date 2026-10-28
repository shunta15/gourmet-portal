import "server-only";
import { getPlaces, type Place } from "@/lib/places";
import { getGeneratedFeatures } from "@/lib/places/features";
import { isUsableImage } from "@/lib/portal/photoRules";
import { shopLinks, socialLinks, type ShopLink } from "@/lib/portal/sns";
import { mapsSearchUrl } from "@/lib/maps";
import { safeDecode } from "@/lib/stations/query";
import { getCategory, getVertical } from "@/lib/verticals";
import { HUMAN_LED, areaText, petAnimals, petBlurb, petLine, petLineOk, petParagraphs, petPhotos, petTags, toPetShop, type PetPhoto, type PetShop } from "../../search/live/liveData";

/**
 * 店舗紹介(本番 /pet/shop/{id})に出すものを、1 店ぶん用意する(サーバー専用)。実在の店(getPlaces('pet'))の実在のデータだけ。
 * 値が無い欄は空にして、画面側で出さない。文は出す前に点検する(liveData.ts の petLineOk 等)。料金は出さない(メニューは名前と所要時間だけ)。
 * 店と特集記事の対応は ID の完全一致(特集の placeId === 店の ID)。特集のある店は、その特集の本文も同じページに出す。
 */

export type FacIcon = "dog-s" | "dog-l" | "car" | "cat" | "moon" | "paw";
export type Facility = { label: string; icon: FacIcon };
export type HeroTag = { label: string; icon: "dog" | "cat" | "moon" | "car" | "paw" };

export type StoryPoint = { name: string; purpose: string; body: string[]; specs: { k: string; v: string }[] };
export type Story = { kicker: string; title: string; subtitle: string; lede: string[]; points: StoryPoint[]; quote: string; quoteCite: string; closing: string[] };

export type StripPhoto = PetPhoto & { sw: number };

export type ShopDetail = {
  place: Place;
  shop: PetShop;
  nameKana?: string;
  /** 店の写真(店のデータ → 特集の写真の順。重ならない) */
  photos: PetPhoto[];
  /** 写真の並び(ヒーローの次から。横幅に収まる分だけ。sw = 見本の単位での横幅) */
  strip: StripPhoto[];
  headline: string;
  /** 「お店について」の文(段落) */
  about: string[];
  /** 紹介の見出しつき本文(特集の無い店) */
  sections: { heading: string; body: string[] }[];
  story?: Story;
  menus: { name: string; minutes?: number }[];
  facilities: Facility[];
  heroTags: HeroTag[];
  hours: string[];
  holidays?: string;
  phone?: string;
  station?: string;
  address: string;
  website?: string;
  /** ヒーローのボタン(最大 2 つ。1 つめが主) */
  cta: ShopLink[];
  /** SNS(公式サイト以外) */
  socials: ShopLink[];
  map: { href: string };
  /** 店舗情報の表 */
  rows: { k: string; v: string; href?: string }[];
  sources: { label: string; url: string }[];
  checkedAt?: string;
  /** 同じエリア・同じ種類の店(最大 8) */
  related: PetShop[];
  /** JSON-LD 用 */
  path: string;
  schemaType: string;
  ogPhoto?: PetPhoto;
};

/** 写真の並びの横幅(見本の単位)。写真の縦横比に合わせて 116〜216(見本の 5 枚が 116〜216) */
function stripWidth(p: PetPhoto): number {
  const aspect = p.w && p.h ? p.w / p.h : 1.5;
  return Math.round(Math.min(216, Math.max(116, 111 * aspect)));
}

const FAC_ICON = (t: string): FacIcon => {
  if (/大型犬/.test(t)) return "dog-l";
  if (/小型犬|中型犬|超小型/.test(t)) return "dog-s";
  if (/猫/.test(t)) return "cat";
  if (/夜間|夜|24時間/.test(t)) return "moon";
  if (/送迎|駐車|パーキング/.test(t)) return "car";
  return "paw";
};

const TAG_ICON = (t: string): HeroTag["icon"] => {
  if (/犬/.test(t)) return "dog";
  if (/猫/.test(t)) return "cat";
  if (/夜間|夜|24時間/.test(t)) return "moon";
  if (/送迎|駐車|パーキング/.test(t)) return "car";
  return "paw";
};

function facilitiesOf(p: Place, tags: string[]): Facility[] {
  const at = (p.attributes ?? {}) as { services?: string[]; sizeLimit?: string; pickup?: boolean };
  const out: Facility[] = [];
  const seen = new Set<string>();
  const add = (label: string, icon: FacIcon) => {
    const l = label.trim();
    if (!l || seen.has(l) || !petLineOk(l)) return;
    seen.add(l);
    out.push({ label: l, icon });
  };
  if (at.pickup === true) add("送迎あり", "car");
  for (const t of tags) add(t, FAC_ICON(t));
  for (const s of at.services ?? []) add(s, FAC_ICON(s));
  if (at.sizeLimit) add(`サイズ ${at.sizeLimit}`, "paw");
  return out.slice(0, 12);
}

export async function loadPetShopDetail(rawId: string): Promise<ShopDetail | null> {
  const id = safeDecode(rawId);
  const places = await getPlaces("pet");
  const p = places.find((x) => x.id === id);
  if (!p) return null;
  const v = getVertical("pet");
  const cat = getCategory(v, p.category);
  const kind = p.category;

  const feat = (await getGeneratedFeatures("pet")).find((f) => f.placeId === p.id);

  // 写真: 店のデータの写真(使えるもの)。特集のある店は、その特集の写真(ヒーロー・各ポイント)も同じ店の写真として足す(重なりは除く)
  let photos = petPhotos(p);
  if (feat) {
    const have = new Set(photos.map((x) => x.src));
    const extraSrc = [feat.article.heroImage, ...feat.article.ranking.flatMap((r) => r.images)].filter((x, i, a) => !!x && a.indexOf(x) === i);
    photos = [
      ...photos,
      ...extraSrc
        .filter((src) => isUsableImage(src) && !have.has(src) && !HUMAN_LED.test(feat.photos[src]?.alt ?? ""))
        .map((src) => ({ src, alt: feat.photos[src]?.alt ?? `${p.name} — 店の写真`, w: feat.photos[src]?.w, h: feat.photos[src]?.h })),
    ];
  }

  // 写真の並び: ヒーロー(1 枚め)の次から、横幅(見本の 876・間 4.5)に収まる分
  const strip: StripPhoto[] = [];
  let used = 0;
  for (const ph of photos.slice(1)) {
    const sw = stripWidth(ph);
    const need = sw + (strip.length ? 4.5 : 0);
    if (used + need > 876 || strip.length >= 5) break;
    strip.push({ ...ph, sw });
    used += need;
  }

  const animals = petAnimals(p);
  const tags = petTags(p);
  const heroTags: HeroTag[] = [
    ...animals.map((a) => ({ label: `${a}に対応`, icon: TAG_ICON(a) })),
    ...tags.map((t) => ({ label: t, icon: TAG_ICON(t) })),
  ].filter((t, i, a) => a.findIndex((x) => x.label === t.label) === i).slice(0, 4);

  const art = p.article;
  const about = petParagraphs(art?.lede ?? p.intro, kind);
  const story: Story | undefined = feat
    ? {
        kicker: feat.article.kicker,
        title: petLine(feat.article.title, kind),
        subtitle: petLine(feat.article.subtitle, kind),
        lede: petParagraphs(feat.article.lede, kind),
        points: feat.article.ranking
          .map((r) => ({
            name: petLine(r.name, kind),
            purpose: petLine(r.purpose, kind),
            body: petParagraphs(r.desc, kind),
            specs: r.specs.filter((sp) => petLineOk(`${sp.k}${sp.v}`, kind === "vet")),
          }))
          .filter((r) => r.body.length > 0 && r.name),
        quote: petLine(feat.article.quote, kind),
        quoteCite: feat.article.quoteCite ?? "",
        closing: petParagraphs(feat.article.closing, kind),
      }
    : undefined;
  const sections = story
    ? []
    : (art?.sections ?? [])
        .map((s) => ({ heading: petLine(s.heading, kind), body: petParagraphs(s.body, kind) }))
        .filter((s) => s.body.length > 0 && s.heading);

  const mapHref = p.mapUrl ?? mapsSearchUrl(p.name, p.address);
  const all = shopLinks({
    phone: p.phone,
    mapUrl: mapHref,
    reservationUrl: p.reservationUrl,
    instagram: p.instagram,
    tiktok: p.tiktok,
    x: p.x,
    facebook: p.facebook,
    line: p.line,
    website: p.website,
  });
  const byKind = (k: ShopLink["kind"]) => all.find((l) => l.kind === k);
  // ヒーローのボタン(最大 2): 予約 or 公式サイト が主、電話 or 地図 が副。予約も公式サイトも無い店(公式サイトが開けず Instagram だけ載せる店)は、Instagram を主にする
  const mainLink = byKind("reserve") ?? byKind("website") ?? byKind("instagram");
  const subLink = byKind("phone") ?? byKind("map");
  const cta = [mainLink, subLink].filter((x): x is ShopLink => !!x);
  const socials = socialLinks({ instagram: p.instagram, tiktok: p.tiktok, x: p.x, facebook: p.facebook, line: p.line, website: p.website }).filter((l) => l.kind !== "website");
  const site = byKind("website");

  const rows: ShopDetail["rows"] = [];
  const addRow = (k: string, val: string | undefined, href?: string) => val && rows.push({ k, v: val, href });
  addRow("種類", cat?.name);
  addRow("エリア", areaText(p));
  addRow("最寄り駅", p.station);
  addRow("対応動物", animals.length ? animals.join("・") : undefined);
  const res = byKind("reserve");
  if (res) addRow("予約", "予約ページあり", res.href);
  addRow("情報の確認日", art?.checkedAt ? japaneseDate(art.checkedAt) : undefined);

  const menus = (art?.menus ?? []).filter((m) => petLineOk(m.name, kind === "vet")).map((m) => ({ name: m.name, minutes: m.minutes }));

  const shop = toPetShop(p);
  const rest = places.filter((x) => x.id !== p.id).map(toPetShop);
  const sameArea = rest
    .filter((x) => x.pref === p.pref)
    .sort((a, b) => Number(b.city === shop.city) - Number(a.city === shop.city) || Number(b.kind === shop.kind) - Number(a.kind === shop.kind) || a.id.localeCompare(b.id))
    .slice(0, 4);
  const sameKind = rest
    .filter((x) => x.kind === p.category && !sameArea.some((y) => y.id === x.id))
    .sort((a, b) => Number(b.pref === p.pref) - Number(a.pref === p.pref) || a.id.localeCompare(b.id))
    .slice(0, 4);

  return {
    place: p,
    shop,
    nameKana: p.nameKana,
    photos,
    strip,
    headline: petLine(art?.headline, kind) || petBlurb(art?.lede ?? p.intro, kind, 60),
    about,
    sections,
    story,
    menus,
    facilities: facilitiesOf(p, tags),
    heroTags,
    hours: p.hours ? p.hours.split(" / ") : [],
    holidays: p.holidays,
    phone: p.phone,
    station: p.station,
    address: p.address,
    website: site?.href,
    cta,
    socials,
    map: { href: mapHref },
    rows,
    sources: art?.sources ?? [],
    checkedAt: art?.checkedAt,
    related: [...sameArea, ...sameKind],
    path: `${v.path}/shop/${p.id}`,
    schemaType: cat?.schemaType ?? "LocalBusiness",
    ogPhoto: photos[0],
  };
}

/** "2026-10-09" → "2026年10月9日"(形式が違えばそのまま) */
export function japaneseDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}
