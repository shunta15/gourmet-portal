/**
 * ボディケアの「さがす」の設定(lib/portal/colorplay/site.ts の CpSite の形。ビューティーの BEAUTY_SITE と同じ使い方で、絞り込みの関数(lib/portal/colorplay/search.ts)を使い回す)。
 * 種類はボディケアの定義(lib/verticals/bodycare.ts)の並び。件数 0 の種類は画面に出さない。strict=true は効き目を思わせる文を落とす点検を広げる。
 */
import type { CpSite } from "@/lib/portal/colorplay/site";
import { getVertical } from "@/lib/verticals";

export const BODYCARE_SITE: CpSite = {
  key: "bodycare",
  base: "/bodycare",
  verticalName: "ボディケア",
  logoA: "マチノワ",
  logoB: "Bodycare",
  theme: "calm",
  noun: "店",
  kinds: getVertical("bodycare").categories.map((c) => ({ slug: c.slug, name: c.name })),
  searchLead: "種類・エリア・こだわり・キーワードで、ボディケアの店を探せます。",
  placeholder: "エリア・店名で検索",
  strict: true,
  scriptSearch: "",
  scriptShop: "",
  scriptAbout: "",
};
