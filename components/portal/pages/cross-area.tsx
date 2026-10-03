/**
 * 業種横断の街ページ（県）。/area/{pref}
 * グルメは既存の /region/{key}（lib/areas/gourmet.ts の対応表で引く）。新業種は /{v}/area/{pref}。
 * 件数は実データだけ。0 のときは「掲載準備中」を出し、リンクは張らない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { gourmetRegionKey } from "@/lib/areas/gourmet";
import { getPlaces } from "@/lib/places";
import { VERTICALS, NEW_VERTICAL_KEYS } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { notFoundMetadata, pick } from "./data";
import { Block, PageFrame, accentStyle, type Tone } from "./frame";

type Props = { params: Promise<{ pref: string }> };

/** 業種横断のページは特定の業種の色を持たない（墨と生成り） */
const NEUTRAL: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "街" };

const ORDER = Object.values(VERTICALS);

/** 業種ごとの件数と飛び先。グルメは region キーで数える（Place.pref はグルメだと region キーのため） */
async function rowsFor(pref: string) {
  const gKey = gourmetRegionKey(pref);
  return Promise.all(
    ORDER.map(async (v) => {
      if (v.key === "gourmet") {
        const count = gKey ? (await getPlaces("gourmet", { pref: gKey })).length : 0;
        return { v, count, href: gKey ? `/region/${gKey}` : null };
      }
      const count = pick(await getPlaces(v.key), { pref }).length;
      return { v, count, href: count > 0 ? `${v.path}/area/${pref}` : null };
    }),
  );
}

export function generateStaticParams() {
  return PREFECTURES.map((p) => ({ pref: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pref } = await params;
  const area = getPrefBySlug(pref);
  if (!area) return notFoundMetadata();
  // index 判定は新業種の掲載数で行う（lib/seo/gate.ts）。新業種が 3 件に満たないあいだは noindex
  const newCount = pick((await Promise.all(NEW_VERTICAL_KEYS.map((k) => getPlaces(k)))).flat(), { pref }).length;
  return buildMetadata({
    vertical: "portal",
    title: `${area.short}の店を業種から探す｜マチノワ`,
    description: `${area.short}のグルメ・ビューティー・ボディケア・ペット・おでかけ・ステイ。業種をまたいで、街の店を探せます。`,
    path: `/area/${pref}`,
    count: newCount,
  });
}

export default async function Page({ params }: Props) {
  const { pref } = await params;
  const area = getPrefBySlug(pref);
  if (!area) notFound();
  const rows = await rowsFor(pref);
  const total = rows.reduce((a, r) => a + r.count, 0);

  return (
    <PageFrame
      tone={NEUTRAL}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: area.short, href: `/area/${pref}` },
      ]}
      kicker="Machinowa — Area"
      heading={`${area.short}の店を業種から探す`}
      lead={`${area.short}のグルメ・ビューティー・ボディケア・ペット・おでかけ・ステイを、業種ごとに見渡せます。`}
      count={total}
    >
      <Block id="mp-xv-h" kicker="Verticals" title={`${area.short}の業種別の掲載`}>
        <ul className="mp-xv">
          {rows.map(({ v, count, href }) => {
            const face = VERTICAL_FACE[v.key];
            const inner = (
              <>
                <span className="g" aria-hidden="true">{face.glyph}</span>
                <b className="nm">{v.name}</b>
                <span className="ct">
                  {count > 0 ? (
                    <>
                      <strong>{count}</strong>件
                    </>
                  ) : (
                    "掲載準備中"
                  )}
                </span>
                {href && <span className="go">{v.name}を見る →</span>}
              </>
            );
            return (
              <li key={v.key} style={accentStyle(v)}>
                {href ? (
                  <Link href={href} prefetch={false} className="mp-xv-card" data-cursor={face.en.toUpperCase()}>
                    {inner}
                  </Link>
                ) : (
                  <div className="mp-xv-card">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Block>

      <Block id="mp-xv-hub-h" kicker="Entrances" title="業種の入口">
        <ul className="mp-others six">
          {ORDER.map((v) => (
            <li key={v.key} style={accentStyle(v)}>
              <Link href={v.path} prefetch={false} data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>
                <span className="g" aria-hidden="true">{VERTICAL_FACE[v.key].glyph}</span>
                <b>{v.name}</b>
                <small>{VERTICAL_FACE[v.key].en}</small>
              </Link>
            </li>
          ))}
        </ul>
      </Block>
    </PageFrame>
  );
}
