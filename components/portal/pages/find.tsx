/**
 * 総合サイトのサイト内検索の結果ページ。/find?q=（常に noindex・canonical は /find）
 * ヘッダーの検索の送信先。JS が無くても動くよう、サーバーで描画する（候補データは lib/portal/searchIndex.ts。
 * 照合は lib/portal/searchCore.ts でヘッダーの候補と同じ）。グルメの既存 /search は変えない。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { getSearchIndex } from "@/lib/portal/searchIndex";
import { KIND_LABEL, KIND_ORDER, search, type Candidate, type SearchKind } from "@/lib/portal/searchCore";
import { Block, PageFrame, accentStyle, type Tone } from "./frame";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const NEUTRAL: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "探" };

/** 1つのグループに出す最大件数（超えた分は件数だけ出す） */
const SHOW_MAX = 40;

async function readQuery(searchParams: Props["searchParams"]): Promise<string> {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  // 制御文字を除き、長さを抑える
  return (raw ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 80);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await readQuery(searchParams);
  return buildMetadata({
    vertical: "portal",
    title: q ? `「${q}」の検索結果｜マチノワ` : "サイト内検索｜マチノワ",
    description: "駅・都道府県・市区町村・業種・店名から、マチノワに掲載しているページを探せます。",
    path: "/find",
    // 検索結果は薄いページなので常に noindex（count 0）
    count: 0,
  });
}

export default async function Page({ searchParams }: Props) {
  const q = await readQuery(searchParams);
  const { prepared } = await getSearchIndex();
  const hits = q
    ? search(prepared, q, { limit: 5000, caps: { pref: 100, station: 5000, town: 5000, category: 500, shop: 5000 } })
    : [];
  const groups = KIND_ORDER.map((kind) => ({ kind, list: hits.filter((h) => h.kind === kind) })).filter((g) => g.list.length > 0);

  return (
    <PageFrame
      tone={NEUTRAL}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "サイト内検索", href: "/find" },
      ]}
      kicker="Machinowa — Search"
      heading={q ? `「${q}」の検索結果` : "サイト内検索"}
      lead={
        q
          ? hits.length > 0
            ? `${hits.length}件のページが見つかりました。`
            : "該当するページは見つかりませんでした。"
          : "駅名・都道府県・市区町村・業種・店名で、マチノワのページを探せます。"
      }
    >
      <section className="mp-pg-sec mp-find-sec" aria-label="検索">
        <div className="mp-wrap">
          <form className="mp-find-form" action="/find" method="get" role="search">
            <label htmlFor="mp-find-q" className="mp-sr">駅・エリア・店名で検索</label>
            <input id="mp-find-q" type="search" name="q" defaultValue={q} placeholder="駅・エリア・店名で探す" autoComplete="off" />
            <button type="submit">検索</button>
          </form>
        </div>
      </section>

      {groups.map(({ kind, list }) => (
        <Block key={kind} id={`mp-find-${kind}-h`} kicker={KIND_LABEL[kind]} title={`${KIND_LABEL[kind]}（${list.length}）`}>
          <ResultList kind={kind} list={list.slice(0, SHOW_MAX)} />
          {list.length > SHOW_MAX && <p className="mp-map-note">ほか{list.length - SHOW_MAX}件あります。語を足して絞り込んでください。</p>}
        </Block>
      ))}

      {(!q || hits.length === 0) && (
        <Block id="mp-find-more-h" kicker="More" title="ほかの探し方">
          <ul className="mp-chips">
            <li>
              <Link href="/station" prefetch={false} data-cursor="STATION">駅から探す</Link>
            </li>
            <li>
              <Link href="/map" prefetch={false} data-cursor="MAP">地図で探す</Link>
            </li>
            <li>
              <Link href="/videos" prefetch={false} data-cursor="VIDEO">動画で探す</Link>
            </li>
            {Object.values(VERTICALS).map((v) => (
              <li key={v.key} style={accentStyle(v)}>
                <Link href={v.path} prefetch={false} data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>
                  {v.name}
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      )}
    </PageFrame>
  );
}

function ResultList({ kind, list }: { kind: SearchKind; list: Candidate[] }) {
  return (
    <ul className="mp-find-list" data-kind={kind}>
      {list.map((c) => (
        <li key={c.href}>
          <Link href={c.href} prefetch={false} className="mp-find-item" data-cursor="ENTER">
            <b>{c.name}</b>
            {c.sub && <small>{c.sub}</small>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
