/**
 * 動画で探す。/videos
 * スマホは縦スワイプ（scroll-snap で1本ずつ画面いっぱい）、PC はグリッド。
 * 業種（?v=）・都道府県（?pref=）で絞り込む（クエリ。サーバーで絞る）。
 * index 判定: 投稿日が分かる動画（VideoObject を出せる動画）が 3 本以上あるときだけ。絞り込み表示は常に noindex。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { buildMetadata } from "@/lib/seo/meta";
import { getAllVideos } from "@/lib/videos";
import type { Video } from "@/lib/videos/types";
import { getVideoStores, type VideoStore } from "@/lib/videos/stores";
import { isVideoIndexable } from "@/lib/videos/display";
import VideoCard from "@/components/portal/video/VideoCard";
import { Block, PageFrame, type Tone } from "./frame";

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "動" };

type SP = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SP> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = first(sp.v) !== undefined || first(sp.pref) !== undefined;
  const indexable = getAllVideos().filter(isVideoIndexable).length;
  return buildMetadata({
    vertical: "portal",
    title: "動画で探す｜マチノワ",
    description: "店を紹介する縦型のショート動画を、業種・都道府県から探せます。動画から店のページ、最寄りの駅の周辺へ進めます。",
    path: "/videos",
    // 絞り込み表示は薄いページになるので index にしない（canonical は /videos）
    count: filtered ? 0 : indexable,
  });
}

/** 動画の業種（映っている店の業種。店に紐づかない動画は動画に付けた業種） */
function verticalsOf(v: Video, stores: VideoStore[]): Set<VerticalKey> {
  const set = new Set<VerticalKey>(stores.map((s) => s.vertical.key));
  if (set.size === 0 && v.industry) set.add(v.industry);
  return set;
}

function href(f: { v?: string; pref?: string }): string {
  const q = new URLSearchParams();
  if (f.v) q.set("v", f.v);
  if (f.pref) q.set("pref", f.pref);
  const s = q.toString();
  return s ? `/videos?${s}` : "/videos";
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const all = getAllVideos();
  const stores = await getVideoStores(all.flatMap((v) => v.storeIds));
  const rows = all.map((video) => {
    const ss = video.storeIds.map((id) => stores.get(id)).filter((s): s is VideoStore => !!s);
    return {
      video,
      stores: ss,
      verticals: verticalsOf(video, ss),
      prefs: new Set(ss.map((s) => s.pref).filter((p): p is string => !!p)),
    };
  });

  // 絞り込みの選択肢（実際に動画がある業種・県だけ。件数は実数）
  const verticalCount = new Map<VerticalKey, number>();
  const prefCount = new Map<string, number>();
  for (const r of rows) {
    r.verticals.forEach((k) => verticalCount.set(k, (verticalCount.get(k) ?? 0) + 1));
    r.prefs.forEach((p) => prefCount.set(p, (prefCount.get(p) ?? 0) + 1));
  }
  const verticalOptions = (Object.keys(VERTICALS) as VerticalKey[]).filter((k) => verticalCount.has(k));
  const prefOptions = PREFECTURES.filter((p) => prefCount.has(p.slug));

  // 業種・県として実在する値だけ絞り込みに使う（変な値は無視）。動画が無い業種・県は「該当なし」になる
  const vRaw = first(sp.v);
  const pRaw = first(sp.pref);
  const cur = {
    v: vRaw && Object.hasOwn(VERTICALS, vRaw) ? vRaw : undefined,
    pref: pRaw && getPrefBySlug(pRaw) ? pRaw : undefined,
  };
  const curLabel = [cur.pref ? getPrefBySlug(cur.pref)?.short : null, cur.v ? VERTICALS[cur.v as VerticalKey].name : null]
    .filter(Boolean)
    .join("の");
  const shown = rows.filter(
    (r) => (!cur.v || r.verticals.has(cur.v as VerticalKey)) && (!cur.pref || r.prefs.has(cur.pref)),
  );
  const filtered = !!(cur.v || cur.pref);

  return (
    <PageFrame
      className="mp-vd-page"
      tone={TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "動画で探す", href: "/videos" },
      ]}
      kicker="Machinowa — Video"
      heading="動画で探す"
      lead="店を紹介する縦型のショート動画です。タップで再生して、気になった店のページや、最寄りの駅の周辺へ進めます。"
      count={shown.length}
      unit="本"
      extra={
        (verticalOptions.length > 0 || prefOptions.length > 0) && (
          <nav className="mp-vd-filters" aria-label="動画の絞り込み">
            {verticalOptions.length > 0 && (
              <div className="row">
                <h2>業種</h2>
                <ul>
                  <li>
                    <Link href={href({ pref: cur.pref })} prefetch={false} aria-current={!cur.v ? "true" : undefined}>
                      すべて
                    </Link>
                  </li>
                  {verticalOptions.map((k) => (
                    <li key={k}>
                      <Link
                        href={href({ v: k, pref: cur.pref })}
                        prefetch={false}
                        aria-current={cur.v === k ? "true" : undefined}
                      >
                        {VERTICALS[k].name}
                        <small>{verticalCount.get(k)}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {prefOptions.length > 0 && (
              <div className="row">
                <h2>都道府県</h2>
                <ul>
                  <li>
                    <Link href={href({ v: cur.v })} prefetch={false} aria-current={!cur.pref ? "true" : undefined}>
                      すべて
                    </Link>
                  </li>
                  {prefOptions.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={href({ v: cur.v, pref: p.slug })}
                        prefetch={false}
                        aria-current={cur.pref === p.slug ? "true" : undefined}
                      >
                        {p.short}
                        <small>{prefCount.get(p.slug)}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        )
      }
    >
      {shown.length > 0 ? (
        <section className="mp-pg-sec mp-vd-sec" aria-label="動画の一覧">
          <div className="mp-wrap">
            <ul className="mp-vd-feed">
              {shown.map((r, i) => (
                <li key={r.video.id}>
                  <VideoCard video={r.video} stores={r.stores} eager={i < 2} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="mp-pg-sec mp-vh-note" aria-labelledby="mp-vd-empty-h">
          <div className="mp-wrap mp-note-grid">
            <div>
              <p className="mp-kicker">Status</p>
              <h2 id="mp-vd-empty-h" className="mp-h2 sm">{filtered ? "該当する動画がありません" : "掲載準備中です"}</h2>
            </div>
            <div>
              <p className="mp-note-p">
                {filtered
                  ? `${curLabel}の動画はまだありません。条件を外すと、ほかの動画が見つかります。`
                  : "動画は準備ができ次第、ここに掲載します。"}
              </p>
              <p className="mp-note-links">
                {filtered && <Link href="/videos">すべての動画を見る</Link>}
                <Link href="/station">駅から探す</Link>
                <Link href="/gourmet">グルメを探す</Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {shown.length > 0 && (
        <Block id="mp-vd-more-h" kicker="More" title="ほかの探し方">
          <ul className="mp-chips">
            <li>
              <Link href="/station" prefetch={false} data-cursor="STATION">駅から店を探す</Link>
            </li>
            {cur.pref && (
              <li>
                <Link href={`/area/${cur.pref}`} prefetch={false} data-cursor="AREA">
                  {getPrefBySlug(cur.pref)?.short}の店を業種から探す
                </Link>
              </li>
            )}
            <li>
              <Link href="/gourmet" prefetch={false} data-cursor="GOURMET">グルメを探す</Link>
            </li>
          </ul>
        </Block>
      )}
    </PageFrame>
  );
}
