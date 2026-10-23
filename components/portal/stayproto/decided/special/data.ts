import raw from "@/lib/specials/stay.json";

/**
 * ステイの特集記事(利用シーン記事・業種の特集記事)の読み込み。中身は lib/specials/stay.json(オーナー承認済みの 3 本。ここでは書き換えない)。
 * 文字は JSON のとおりに出す。節の storeIds の宿は、画面で店舗紹介ページ /stay/shop/{id} へのリンクにする。
 */
export type SpecialSection = { heading: string; text: string; storeIds: string[] };
export type StaySpecial = { slug: string; title: string; lead: string; date: string; sections: SpecialSection[]; closing: string };

export const STAY_SPECIALS: StaySpecial[] = raw.items as StaySpecial[];

export const staySpecialBySlug = (slug: string): StaySpecial | null => STAY_SPECIALS.find((s) => s.slug === slug) ?? null;

/** "2026-10-24" → "2026.10.24"(形式が違えばそのまま) */
export function dotDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
}

/** 導入の文を、文の切れ目で max 字までに切った説明(meta description 用) */
export function leadSnippet(lead: string, max = 110): string {
  const sentences = lead.match(/[^。]+。?/g) ?? [lead];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  return out.length > max + 40 ? `${out.slice(0, max)}…` : out;
}

/** 長い段落を、文の切れ目で 2〜3 文ずつの段落に分ける(読みやすさのため。文字は変えない) */
export function paragraphsOf(text: string, limit = 150): string[] {
  const sentences = text.match(/[^。]+。?/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && (cur + s).length > limit) {
      out.push(cur);
      cur = s;
    } else cur += s;
  }
  if (cur) out.push(cur);
  return out;
}
