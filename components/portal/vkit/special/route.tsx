import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { article as articleLd, breadcrumb } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";
import { VERTICALS } from "@/lib/verticals";
import VkFrame from "../common/VkFrame";
import { loadShops, type LiveShop } from "../common/live";
import { vkLinks, type VkConfig } from "../config";
import { SpecialArticleView, SpecialIndexView } from "./VkSpecial";
import { clipLead, loadSpecials, shortName, specialBySlug, specialShops, specialIndexLead } from "./data";

/**
 * 特集のページのルート(/{業種}/special と /{業種}/special/{slug})。スポーツ・くらしで共通(各 app/{業種}/special/ の page.tsx は、これを呼ぶだけ)。
 * 静的なページ(特集の記事は lib/specials/{業種}.json)。slug が無い・特集が無い業種は 404。
 * metadata は他の新業種ページと同じ gate(掲載が 3 件未満なら noindex。buildMetadata の count)。canonical は自分自身。公開スイッチ OFF のあいだは 404(assertPortalLive)。
 * JSON-LD は BreadcrumbList と(記事のページは)Article(著者 マチノワ編集部。星・評価は無い)。
 */

type Props = { params: Promise<{ slug: string }> };

/**
 * 記事ごとの札の写真 = その記事に出てくる写真のある店。ほかの記事の札で使っていない店を先に選ぶ(3 本とも同じ写真にならないように)。
 * どの店も使われていれば、その記事の最初の店。写真のある店が 1 軒も出てこない記事は null(写真の枠は出さない)
 */
function cardPhotos(list: Array<{ sections: Array<{ storeIds: string[] }> }>, shops: Map<string, LiveShop>): Array<LiveShop | null> {
  const used = new Set<string>();
  return list.map((s) => {
    const cand: LiveShop[] = [];
    for (const sec of s.sections)
      for (const id of sec.storeIds) {
        const x = shops.get(id);
        if (x?.photo && !cand.includes(x)) cand.push(x);
      }
    const pick = cand.find((x) => !used.has(x.id)) ?? cand[0] ?? null;
    if (pick) used.add(pick.id);
    return pick;
  });
}

export function vkSpecialIndexPage(cfg: VkConfig) {
  const v = VERTICALS[cfg.key];
  const L = vkLinks(cfg);
  return {
    async generateMetadata() {
      assertPortalLive();
      const specials = loadSpecials(cfg);
      return buildMetadata({
        vertical: cfg.key,
        title: `${shortName(cfg)}の特集｜${v.brand}`,
        description: specials.length > 0 ? `${specialIndexLead(cfg)}${specials.map((s) => s.title).join("、")}の${specials.length}本です。` : specialIndexLead(cfg),
        path: L.special,
        count: await countPlaces(cfg.key),
      });
    },
    async Page() {
      assertPortalLive();
      const specials = loadSpecials(cfg);
      const shops = new Map((await loadShops(cfg)).map((x) => [x.id, x]));
      return (
        <VkFrame cfg={cfg}>
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: v.name, url: absUrl(v.path) },
              { name: "特集", url: absUrl(L.special) },
            ])}
          />
          <SpecialIndexView cfg={cfg} specials={specials} photos={cardPhotos(specials, shops)} />
        </VkFrame>
      );
    },
  };
}

export function vkSpecialArticleRoute(cfg: VkConfig) {
  const v = VERTICALS[cfg.key];
  const L = vkLinks(cfg);
  return {
    generateStaticParams: liveStaticParams(async () => loadSpecials(cfg).map((s) => ({ slug: s.slug }))),

    async generateMetadata({ params }: Props) {
      assertPortalLive();
      const s = specialBySlug(cfg, safeDecode((await params).slug));
      if (!s) return notFoundMetadata();
      return buildMetadata({
        vertical: cfg.key,
        title: `${s.title}｜${v.brand}`,
        description: clipLead(s.lead) || `${s.title}の特集記事です。`,
        path: `${L.special}/${s.slug}`,
        count: await countPlaces(cfg.key),
      });
    },

    async Page({ params }: Props) {
      assertPortalLive();
      const slug = safeDecode((await params).slug);
      const s = specialBySlug(cfg, slug);
      if (!s) notFound();
      const path = `${L.special}/${s.slug}`;
      const shops = await specialShops(cfg, s);
      const all = new Map((await loadShops(cfg)).map((x) => [x.id, x]));
      const list = loadSpecials(cfg);
      const photos = cardPhotos(list, all);
      const others = list.map((o, i) => ({ s: o, n: i + 1, photo: photos[i] })).filter((o) => o.s.slug !== s.slug);
      return (
        <VkFrame cfg={cfg}>
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: v.name, url: absUrl(v.path) },
              { name: "特集", url: absUrl(L.special) },
              { name: s.title, url: absUrl(path) },
            ])}
          />
          <JsonLd
            data={articleLd({
              headline: s.title,
              description: clipLead(s.lead) || s.title,
              image: absUrl(ogImage(path, s.title).url),
              url: absUrl(path),
              datePublished: s.date || undefined,
            })}
          />
          <SpecialArticleView cfg={cfg} s={s} shops={shops} others={others} />
        </VkFrame>
      );
    },
  };
}
