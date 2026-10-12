/** 転がし(KOROGASHI)のデータ。6 つの種類の名前と slug は lib/verticals/bodycare.ts から取る。 */
import { VERTICALS } from "@/lib/verticals";

export const KOROGASHI_LEAD = "整体、整骨院・接骨院、鍼灸院、マッサージ、リラクゼーション、ストレッチの店を、エリア・種類・利用シーンから探せる入口です。";

/** 紙の帯の英字(飾り) */
const EN: Record<string, string> = {
  seitai: "Seitai",
  sekkotsu: "Sekkotsu",
  shinkyu: "Shinkyu",
  massage: "Massage",
  relaxation: "Relaxation",
  stretch: "Stretch",
};

/** ポールの色(原色にしない): 生成り・灰・藍鼠・苔・小豆・墨。 */
export const POLE_COLORS = ["#d8ceb8", "#a3a29c", "#768697", "#7f8864", "#7a4842", "#3b3d40"];

export type KoroKind = { n: number; slug: string; name: string; en: string; href: string; color: string };

export function koroKinds(): KoroKind[] {
  const v = VERTICALS.bodycare;
  return v.categories.map((c, i) => ({ n: i + 1, slug: c.slug, name: c.name, en: EN[c.slug] ?? c.slug, href: `${v.path}/${c.slug}`, color: POLE_COLORS[i] }));
}

/** 下の段の実在の店 6 店(写真は分類の表で face が clear でなく・quality 4 以上・text が false のもの) */
export const SHOP_PICKS: { id: string; photo: string; alt: string }[] = [
  { id: "bo0080", photo: "/_portal/vshops/bodycare-37/g1.jpg", alt: "施術ベッドが並ぶ広い院内" },
  { id: "bo0030", photo: "/_portal/vshops/bodycare-9/s2.jpg", alt: "二台のベッドが並ぶ施術室" },
  { id: "bo0044", photo: "/_portal/vshops/bodycare-88/s1.jpg", alt: "受付と待合の店内" },
  { id: "bo0043", photo: "/_portal/vshops/bodycare-85/s1.jpg", alt: "施術室の室内(ベッドとレンガ壁)" },
  { id: "bo0003", photo: "/_portal/vshops/bodycare-74/s3.jpg", alt: "施術の手元" },
  { id: "bo0062", photo: "/_portal/vshops/bodycare-8/s1.jpg", alt: "施術室のベッドと椅子" },
];
