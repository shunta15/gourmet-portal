/**
 * シーン別まとめ記事（利用シーン + 複数の店。isSceneShopFeature）を、写真が主役の形（components/portal/photoFeature/roundup/RoundupPage.tsx）で出すための
 * データを作る（純関数。fs・process は使わない。軽いファイル）。店舗特集記事の lib/portal/photoFeature/build.ts と同じ部品（toPf・splitExcerpt・tateCols・titleColumns）を使う。
 *
 * - 文は記事のデータにあるものだけ（新しい文・数字は作らない）。リード・店ごとの見出し・紹介・締めは、文の切れ目（。！？）で「最初の数文」と「続きを読む」に割るだけ（字は変えない）。
 * - 店と記事の対応は、記事の項目（ranking[i]）の href（/restaurant/<店 ID>）の完全一致だけ。店名の部分一致は使わない。
 * - 写真は実物だけ（collect.ts の isPhotoUsable: 食べログ・仮の画像・表示禁止・真っ黒な仮の画像・/restaurants/ の外を除く）。
 *   同じ写真（パスが同じ、または見た目の指紋がほぼ同じ）は、1 ページに 1 回だけ（巻頭の写真と店の写真も重ねない）。写真の幅・高さ・指紋は roundupPhotoMeta.generated.ts（無い写真は 4:3）。
 * - 写真が無い店は、暗い空の枠を出さず、和紙の面に店名を大きな縦書きで見せる（photos が空 → RoundupPage が bare で出す）。
 */
import type { FeatureArticle } from "@/lib/regions";
import { mapsUrlForRankItem } from "@/lib/maps";
import { stripTabelogScore } from "@/lib/portal/noren/tabelogScore";
import { hashDistance, isPhotoUsable, SAME_PHOTO_BITS, type Photo } from "./collect";
import { PHOTO_META } from "./photoMeta.generated";
import { ROUNDUP_PHOTO_META } from "./roundupPhotoMeta.generated";
import { paragraphs, splitExcerpt, tateCols, titleColumns, toPf, type PfData, type PfPhoto, type PfText, type Rv } from "./build";
import { sceneGateUnits, storeMark, type RpUnit } from "./roundupMark";

export type RpStore = {
  /** "01" … */
  no: string;
  /** 店の ID（href の /restaurant/<ID>）。無ければ空 */
  id: string;
  /** 店ページへの行き先（記事のデータの href そのまま） */
  href: string;
  name: string;
  cuisine: string;
  area: string;
  /** 縦書きの店名の列 */
  cols: string[];
  /** 店ごとの小さな暖簾に染める字 */
  mark: RpUnit[];
  /** 項目の小見出し（あれば） */
  heading: string;
  /** 紹介の文: 最初の数文 + 「続きを読む」の残り */
  text: PfText;
  /** 店の情報（記事のデータにある項目をそのまま。住所・営業時間・予算など） */
  specs: { k: string; v: string }[];
  mapsUrl: string;
  /** 0〜3 枚。0 枚なら、和紙の面に店名を大きな縦書きで見せる */
  photos: PfPhoto[];
  variant: "A" | "B" | "C" | "D";
  rv: Rv;
  /** 暗い面の区画か（和紙と交互。写真のある店だけ） */
  dark: boolean;
};

export type RoundupData = {
  id: string;
  title: PfData["title"];
  subCols: string[];
  lede: PfText;
  hero: PfPhoto | null;
  heroAlt: string;
  /** 利用シーンの語（Feature.tag）。入口の暖簾に染める */
  tag: string;
  gate: string[];
  stores: RpStore[];
  quote: string[];
  closing: PfText;
  /** 写真のない店の数 */
  noPhoto: number;
  /** 使った写真の枚数（巻頭 + 店） */
  photoCount: number;
};

const NFC = (s: string) => s.normalize("NFC");
const metaOf = (src: string) => ROUNDUP_PHOTO_META[src] ?? ROUNDUP_PHOTO_META[NFC(src)] ?? PHOTO_META[src] ?? PHOTO_META[NFC(src)] ?? null;
const photoOf = (src: string): Photo => {
  const m = metaOf(src);
  return { src, w: m ? m[0] : 0, h: m ? m[1] : 0 };
};
/** 同じ写真か（パスが同じ、または縦横の比が近く見た目の指紋がほぼ同じ） */
const sameShot = (a: string, b: string): boolean => {
  if (NFC(a) === NFC(b)) return true;
  const ma = metaOf(a);
  const mb = metaOf(b);
  if (!ma || !mb) return false;
  const ra = ma[0] / ma[1];
  const rb = mb[0] / mb[1];
  if (Math.abs(ra - rb) / Math.max(ra, rb) > 0.12) return false;
  return hashDistance(ma[2], mb[2]) <= SAME_PHOTO_BITS;
};

/** 店ごとの写真（1 店 3 枚まで・全体で重複なし）と、巻頭の写真を決める */
export function pickRoundupPhotos(A: Pick<FeatureArticle, "heroImage" | "ranking">): { hero: Photo | null; perStore: Photo[][] } {
  const used: Photo[] = [];
  const per: Photo[][] = A.ranking.map((r) => {
    const got: Photo[] = [];
    for (const s of r.images ?? []) {
      if (!isPhotoUsable(s)) continue;
      const p = photoOf(s);
      if (used.some((q) => sameShot(q.src, p.src)) || got.some((q) => sameShot(q.src, p.src))) continue;
      got.push(p);
    }
    const kept = got.slice(0, 3);
    used.push(...kept);
    return kept;
  });

  // 写真が 2 枚以上ある店の写真のうち、いちばん大きい（横長を優先）1 枚を、巻頭に回す（その店には 1 枚以上が残る）
  const spare = (minW: number): Photo | null => {
    let best: { i: number; j: number; score: number } | null = null;
    per.forEach((l, i) => {
      if (l.length < 2) return;
      l.forEach((p, j) => {
        if (p.w < minW) return;
        const ar = p.h > 0 ? p.w / p.h : 1.33;
        const score = p.w * p.h * (ar >= 1.2 && ar <= 2 ? 1 : 0.6);
        if (!best || score > best.score) best = { i, j, score };
      });
    });
    if (!best) return null;
    const b: { i: number; j: number } = best;
    return per[b.i].splice(b.j, 1)[0];
  };

  const cand = isPhotoUsable(A.heroImage) ? photoOf(A.heroImage) : null;
  let hero: Photo | null = null;
  if (cand) {
    let at: [number, number] | null = null;
    per.forEach((l, i) => l.forEach((p, j) => {
      if (sameShot(p.src, cand.src)) at = [i, j];
    }));
    const small = cand.w > 0 && cand.w < 1000;
    if (!at) hero = small ? (spare(Math.max(700, cand.w + 1)) ?? cand) : cand;
    else {
      const [i, j] = at as [number, number];
      if (per[i].length >= 2) {
        const alt = small ? spare(Math.max(700, cand.w + 1)) : null;
        if (alt) hero = alt;
        else {
          per[i].splice(j, 1);
          hero = cand;
        }
      } else hero = spare(0); // 巻頭の写真がその店のただ 1 枚のとき: 別の店の写真を巻頭に回す（なければ巻頭に写真は出さない）
    }
  } else hero = spare(0);
  return { hero, perStore: per };
}

const VARIANTS = ["A", "C", "B", "D"] as const;
const SINGLE: Rv[] = ["curtain", "tilt", "flow", "paper"];

export function buildRoundup(A: FeatureArticle, ctx: { tag: string }): RoundupData {
  const { hero: heroPh, perStore } = pickRoundupPhotos(A);
  const heroPf = heroPh ? toPf(heroPh, `${A.title}（巻頭の写真）`) : null;

  let si = 0;
  const stores: RpStore[] = A.ranking.map((r, i) => {
    const id = (r.href ?? "").split("/").pop() ?? "";
    const photos = perStore[i].map((p) => toPf(p, `${r.name}（写真）`));
    const rv: Rv = photos.length >= 2 ? "converge" : photos.length === 1 ? SINGLE[si++ % SINGLE.length] : "none";
    // 中身が枠の中で流れる現れ方（flow）は、枠の外が見えないよう少し拡大しておく（build.ts と同じ）
    if (rv === "flow") for (const p of photos) { p.cap = Math.round((p.cap * 1.04) / 1.12); p.z = 1.12; }
    return {
      no: String(i + 1).padStart(2, "0"),
      id,
      href: r.href ?? "",
      name: r.name,
      cuisine: r.cuisine ?? "",
      area: r.area ?? "",
      cols: tateCols(r.name, 11, 3),
      mark: storeMark(id, r.name),
      heading: r.heading ? stripTabelogScore(r.heading) : "",
      text: splitExcerpt(stripTabelogScore(r.desc)),
      specs: r.specs.map((s) => ({ k: s.k, v: s.v })),
      mapsUrl: mapsUrlForRankItem(r),
      photos,
      variant: VARIANTS[i % VARIANTS.length],
      rv,
      dark: i % 2 === 1 && photos.length > 0,
    };
  });

  const sub = A.subtitle ? stripTabelogScore(A.subtitle) : "";
  return {
    id: A.id,
    title: titleColumns(A.titleHTML, A.title),
    subCols: sub ? tateCols(sub, 12, 2) : [],
    lede: splitExcerpt(stripTabelogScore(A.lede)),
    hero: heroPf,
    heroAlt: `${A.title}（巻頭の写真）`,
    tag: ctx.tag,
    gate: sceneGateUnits(ctx.tag),
    stores,
    quote: A.quote ? paragraphs(stripTabelogScore(A.quote), 90) : [],
    closing: A.closing ? splitExcerpt(stripTabelogScore(A.closing)) : { head: "", rest: [] },
    noPhoto: stores.filter((s) => s.photos.length === 0).length,
    photoCount: (heroPf ? 1 : 0) + stores.reduce((n, s) => n + s.photos.length, 0),
  };
}
