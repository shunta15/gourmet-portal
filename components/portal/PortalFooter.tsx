import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { BLOCK_FACE } from "@/lib/portal/meta";
import { getStationIndex, stationHref } from "@/lib/stations/query";
import FooterAreas, { type FooterAreaGroup } from "./FooterAreas";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];
const BLOCK_ORDER = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州沖縄"];

/** フッターに出す、店の多い駅エリアの数 */
const FOOTER_STATIONS = 12;

/**
 * 総合サイト用フッター（サーバー）。グルメの既存フッター（components/Footer.tsx）とは別物。
 * 総合サイトの各レイアウト（app/{area,station,map,videos,beauty,…}/layout.tsx）と総合トップから出す。
 * リンクは 6 業種・47 都道府県（/area/{pref}）・店の多い駅エリア上位 12・探し方（地図・駅・動画）。
 * 店の件数は実データ（lib/stations/query の集計）。
 */
export default async function PortalFooter() {
  const idx = await getStationIndex();
  const top = idx.all.slice(0, FOOTER_STATIONS);

  const groups: FooterAreaGroup[] = BLOCK_ORDER.map((b) => ({
    label: BLOCK_FACE[b].label,
    en: BLOCK_FACE[b].en,
    items: PREFECTURES.filter((p) => p.block === b).map((p) => ({ name: p.short, href: `/area/${p.slug}` })),
  })).filter((g) => g.items.length > 0);

  return (
    <footer className="mp-ft">
      <div className="mp-wrap">
        <div className="mp-ft-top">
          <div className="mp-ft-col">
            <h2>業種から</h2>
            <ul>
              {ORDER.map((k) => (
                <li key={k} style={{ ["--ac" as string]: VERTICALS[k].accent.color }}>
                  <Link href={VERTICALS[k].path}>
                    <i aria-hidden="true" />
                    {VERTICALS[k].brand}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="sub">探し方</h2>
            <ul>
              <li><Link href="/map" prefetch={false}>地図で探す</Link></li>
              <li><Link href="/station" prefetch={false}>駅から探す</Link></li>
              <li><Link href="/videos" prefetch={false}>動画で探す</Link></li>
            </ul>
          </div>
          <div className="mp-ft-col">
            <h2>グルメを読む</h2>
            <ul>
              <li><Link href="/feature">特集</Link></li>
              <li><Link href="/region">地域から探す</Link></li>
              <li><Link href="/scene">利用シーンから探す</Link></li>
              <li><Link href="/search">店舗を探す</Link></li>
            </ul>
          </div>
          <div className="mp-ft-col">
            <h2>マチノワについて</h2>
            <ul>
              <li><Link href="/about">編集部について</Link></li>
              <li><Link href="/editorial/guidelines">掲載基準</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mp-ft-nav">
          <section className="mp-ft-pref" aria-labelledby="mp-ft-pref-h">
            <h2 id="mp-ft-pref-h">都道府県から探す</h2>
            <FooterAreas groups={groups} />
          </section>
          {top.length > 0 && (
            <section className="mp-ft-stn" aria-labelledby="mp-ft-stn-h">
              <h2 id="mp-ft-stn-h">店の多い駅エリア</h2>
              <ul>
                {top.map((s) => {
                  const st = s.station;
                  return (
                    <li key={st.id}>
                      <Link href={stationHref(st)} prefetch={false}>
                        <span>{st.name.endsWith("駅") ? st.name : `${st.name}駅`}</span>
                        <small>
                          {getPrefBySlug(st.pref ?? "")?.short ?? ""} {s.count}店
                        </small>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p>
                <Link href="/station" prefetch={false}>
                  駅エリアをすべて見る（{idx.all.length}）<span aria-hidden="true"> →</span>
                </Link>
              </p>
            </section>
          )}
        </div>

        <p className="mp-ft-mark" aria-hidden="true">
          マチノワ<em>Machinowa</em>
        </p>
        <div className="mp-ft-bot">
          <span>© マチノワ</span>
        </div>
      </div>
    </footer>
  );
}
