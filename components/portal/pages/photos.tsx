/**
 * 写真から探す。/photos
 * 掲載店の料理写真が壁のように並び、気になる一枚を押すと店の名前・街・ジャンルと「店のページへ」が開く。
 * ?genre={key}&pref={slug} … 最初に絞り込んでおく（ページ内の操作でも、その場で絞り込める。URL も同期する）。
 *   正しくない値は無視して全体を出す。絞り込んだ URL は薄いページになるので noindex（canonical は /photos）。
 * 写真・店の名前・街・ジャンルはすべて実データ（lib/portal/photoWall.ts）。星・点数・口コミ数は出さない。
 * 壁は掲載店の写真が 3 枚以上あるときだけ index 対象（lib/seo/gate.ts）。
 */
import type { Metadata } from "next";
import { assertPortalLive } from "@/lib/portal/launch";
import { buildMetadata } from "@/lib/seo/meta";
import { loadWall } from "@/lib/portal/photoWall";
import type { WallData } from "@/lib/portal/photoWallShared";
import PhotoWall from "../photos/PhotoWall";
import { PageFrame, type Tone } from "./frame";

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "写" };

type SP = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SP> };

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** URL の ?genre= ?pref= を、実際に写真がある選択肢だけに絞って返す（変な値は空＝絞り込まない） */
function readFilter(sp: SP, data: WallData): { genre: string; pref: string } {
  const g = (first(sp.genre) ?? "").slice(0, 40);
  const p = (first(sp.pref) ?? "").slice(0, 40);
  return {
    genre: data.genres.some((x) => x.key === g) ? g : "",
    pref: data.prefs.some((x) => x.key === p) ? p : "",
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  assertPortalLive();
  const data = await loadWall();
  const f = readFilter(await searchParams, data);
  const filtered = !!(f.genre || f.pref);
  const cond = [data.genres.find((x) => x.key === f.genre)?.label, data.prefs.find((x) => x.key === f.pref)?.label].filter(Boolean).join("・");
  return buildMetadata({
    vertical: "portal",
    title: filtered ? `${cond}の料理写真｜写真から探す｜マチノワ` : "写真から探す｜マチノワ",
    description: `全国の掲載店の料理写真${data.items.length}枚を、ジャンル・都道府県で絞り込めます。気になる一枚を押すと、店の名前と街、店のページへの入口が開きます。`,
    path: "/photos",
    // 絞り込んだ URL は薄いページ・重複なので index にしない（count 0 → noindex）。何も絞らない /photos は枚数で判定
    count: filtered ? 0 : data.items.length,
  });
}

export default async function Page({ searchParams }: Props) {
  assertPortalLive();
  const data = await loadWall();
  const f = readFilter(await searchParams, data);

  return (
    <PageFrame
      className="mp-ph-page"
      tone={TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "写真から探す", href: "/photos" },
      ]}
      kicker="Machinowa — Photos"
      heading="写真から探す"
      lead="全国の掲載店の料理写真を、壁のように並べました。気になる一枚を押すと、店の名前と街、店のページへの入口が開きます。"
    >
      <section className="mp-pg-sec mp-ph-sec" aria-label="料理の写真の壁">
        <PhotoWall key={`${f.genre}|${f.pref}`} data={data} initial={f} />
      </section>
    </PageFrame>
  );
}
