/**
 * スポーツ・くらしの、これまでの種類・県×種類・エリア・利用シーンのページ(728 本)から、探す(/{v}/search)の絞り込みへの恒久の転送(308)。
 * ページ(app/{v}/(sub)/(portal)/[category] など)は 2026-10-27 に消した(オーナー「728 ページも必要ない」)。転送だけを next.config.ts の redirects に持つ(page.tsx 無しで、外から来た古い URL が 404 にならない)。
 * 転送先は components/portal/{sports,life}/redirects.ts が決めていた形と同じ:
 *   /{v}/{種類}                  → /{v}/search?kind=
 *   /{v}/{種類}/{県}             → /{v}/search?kind=&pref=
 *   /{v}/{種類}/{県}/{市}        → /{v}/search?kind=&pref=(市の絞り込みは探すに無いので県まで)
 *   /{v}/area/{県}               → /{v}/search?pref=
 *   /{v}/area/{県}/{市}          → /{v}/search?pref=
 *   /{v}/scene/{slug}            → /{v}/search(利用シーンに当たる絞り込みが探すに無いので引数なし)
 * 種類・県・シーンは、実在の slug だけを列挙して当てる(知らない slug は転送せず、今までどおり 404)。県は 0 件の県でも転送する。
 * 実在のルート(search・shop・article・special・feature・sitemap.xml)と ぶつかる slug が種類・シーンに入ったらビルドで落とす。
 * next.config.ts から読むので、`@/` の別名は使わず相対 import だけにする(lib/portal/noren/rewrites.ts と同じ)。
 */
import { PREFECTURES } from "../areas/prefectures";
import { VERTICALS } from "../verticals";

type LegacyKey = "sports" | "life";

/** その業種の app 直下に実在するルートの 1 階層目(種類・シーンの slug と同じ名前にしてはいけない) */
const REAL_ROUTES = new Set(["search", "shop", "article", "special", "feature", "area", "scene", "sitemap.xml", "opengraph-image"]);

export type LegacyRedirect = { source: string; destination: string; permanent: true };

export function legacyVertRedirects(key: LegacyKey): LegacyRedirect[] {
  const v = VERTICALS[key];
  const base = v.path; // "/sports" | "/life"
  const search = `${base}/search`;
  const cats = v.categories.map((c) => c.slug);
  const scenes = v.scenes.map((s) => s.slug);
  const prefs = PREFECTURES.map((p) => p.slug);
  for (const s of [...cats, ...scenes]) {
    if (REAL_ROUTES.has(s)) throw new Error(`legacyVertRedirects(${key}): slug "${s}" が実在のルートとぶつかる`);
  }
  const C = `:category(${cats.join("|")})`;
  const P = `:pref(${prefs.join("|")})`;
  const S = `:slug(${scenes.join("|")})`;
  const r = (source: string, destination: string): LegacyRedirect => ({ source, destination, permanent: true });
  return [
    // 種類×県×市(これまでは常に 404 だったが、県までで絞った状態へ転送していた)。種類×県より先に書かなくても 3 階層目は別の source なので当たり方は変わらない
    r(`${base}/${C}/${P}/:city`, `${search}?kind=:category&pref=:pref`),
    r(`${base}/${C}/${P}`, `${search}?kind=:category&pref=:pref`),
    r(`${base}/${C}`, `${search}?kind=:category`),
    r(`${base}/area/${P}/:city`, `${search}?pref=:pref`),
    r(`${base}/area/${P}`, `${search}?pref=:pref`),
    r(`${base}/scene/${S}`, search),
  ];
}
