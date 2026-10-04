/**
 * 行動ボタン 6 案の見比べ（プレビュー・ローカル専用）。総合サイトの公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）。noindex。
 * 6 案を縦に並べ、それぞれ (a) 実在の店 3 店の実データ、(b) 6 種の SNS が全部そろった場合の見本（リンク先は未登録・押せない）を出す。
 * 設計: proto-portal/SNS-BUTTONS-BRIEF.md（案1〜3）・SNS-BUTTONS-BRIEF-2.md（案4〜6）
 */
import type { Metadata } from "next";
import ShopActions, { type SaVariant } from "@/components/portal/ShopActions";
import Footer from "@/components/Footer";
import { REGIONS } from "@/lib/regions";
import { getRestaurantById, getRestaurantsByRegion } from "@/lib/db/restaurants";
import { getTownOfRestaurant } from "@/lib/db/towns";
import { GEO } from "@/lib/geo";
import { mapsUrlForRestaurant } from "@/lib/maps";
import { ARTICLE_STORE_FEATURE_IDS } from "@/lib/articleStores";
import { assertPortalLive } from "@/lib/portal/launch";
import { restaurantSocialLinks } from "@/lib/portal/shopSocial";
import { shareTarget } from "@/lib/portal/share";
import type { ShopFacts } from "@/lib/portal/shopActions";
import type { ShopLink } from "@/lib/portal/sns";

export function generateMetadata(): Metadata {
  assertPortalLive();
  return {
    title: "行動ボタンの見比べ — マチノワ",
    robots: { index: false, follow: false },
  };
}

/** 見比べに使う実在の店（lib/data.ts・lib/teleapo-restaurants.ts にある店）とその理由 */
const STORES: { id: string; why: string }[] = [
  { id: "r263", why: "Instagram と電話がある店（予約URLなし・アカウント名が長い）" },
  { id: "r33", why: "予約URL・電話・Instagram・座標がそろう店（行動ボタンが最も多いケース）" },
  { id: "r16", why: "予約URLも電話も無い店（Instagram と座標だけ）" },
];

const VARIANTS: { v: SaVariant; no: string; name: string; en: string; note: string }[] = [
  { v: 1, no: "案1", name: "罫", en: "KEI", note: "上の表と同じ細い罫で区切った、幅いっぱいの行。1行が1つのボタン。" },
  { v: 2, no: "案2", name: "印", en: "IN", note: "丸い印のボタン。外周を字が回り、ポインタに少し吸い寄せられる。" },
  { v: 3, no: "案3", name: "箱", en: "HAKO", note: "大小のタイルの盤面。スマホは画面下に行動バーが付く（店ページで確認）。" },
  { v: 4, no: "案4", name: "玉", en: "TAMA", note: "丸みのあるカプセル。hover で文字が送られ、墨が液面のように満ちる。押すと潰れる。（アイコンとラベルだけ）" },
  { v: 5, no: "案5", name: "駒", en: "KOMA", note: "押し込める四角いキー。影の分だけ浮き、押すと影の位置まで沈む。アイコンが主役。（アイコンとラベルだけ）" },
  { v: 6, no: "案6", name: "帯", en: "OBI", note: "一本の帯を区切ったボタン。指した区画が広がり、1 枚の墨がポインタを追って区画を滑る。（アイコンとラベルだけ）" },
];

/** 6 種の SNS が全部そろった場合の見本。実在の店名・実在のアカウントは使わない。リンク先は未登録（押せない状態で出す） */
const SAMPLE_SOCIAL: ShopLink[] = [
  { kind: "instagram", label: "Instagram", href: "https://www.instagram.com/sample_account/", external: true },
  { kind: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@sample_account", external: true },
  { kind: "x", label: "X", href: "https://x.com/sample_account", external: true },
  { kind: "facebook", label: "Facebook", href: "https://www.facebook.com/sample.account", external: true },
  { kind: "line", label: "LINE", href: "https://page.line.me/sample_account", external: true },
  { kind: "website", label: "公式サイト", href: "https://sample.example.com/", external: true },
];
const SAMPLE: ShopFacts = {
  name: "見本",
  phone: "00-0000-0000",
  reservationUrl: "https://reserve.example.com/",
  address: "○○県○○市○○区○○1-2-3",
  area: "○○",
  mapsUrl: "https://maps.example.com/",
  geo: { lat: 35, lng: 135 },
  social: SAMPLE_SOCIAL,
  hasRating: false,
  source: { label: "出典サイト", url: "https://source.example.com/" },
  featureId: "sample",
  town: { name: "○○市○○区", href: "#", count: 6 },
  region: { name: "○○", href: "#" },
};

async function loadStore(id: string): Promise<{ id: string; shop: ShopFacts } | null> {
  const r = await getRestaurantById(id);
  if (!r) return null;
  const regionStores = await getRestaurantsByRegion(r.region);
  const t = await getTownOfRestaurant(r, regionStores);
  const g = GEO[r.id];
  return {
    id: r.id,
    shop: {
      name: r.name,
      phone: r.phone,
      reservationUrl: r.reservationUrl,
      address: r.address,
      area: r.area,
      mapsUrl: mapsUrlForRestaurant(r),
      geo: g ? { lat: g.lat, lng: g.lng } : null,
      social: restaurantSocialLinks(r),
      hasRating: !!r.rating,
      source: r.source ?? null,
      featureId: r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id],
      town: t ? { name: t.town, href: t.href, count: t.count } : null,
      region: { name: REGIONS[r.region].name, href: `/region/${r.region}` },
    },
  };
}

const cap: React.CSSProperties = { font: "500 12px/1.6 var(--mono)", letterSpacing: ".14em", color: "var(--ink-soft)", margin: "0 0 4px" };
const why: React.CSSProperties = { font: "400 14px/1.7 var(--body)", color: "var(--ink-soft)", margin: "0 0 4px" };

export default async function ProtoSnsPage() {
  assertPortalLive();
  const loaded = (await Promise.all(STORES.map((s) => loadStore(s.id)))).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="feat-page">
      <div className="feat-body" style={{ paddingTop: 120 }}>
        <section className="article" style={{ paddingTop: 40 }}>
          <div className="article-head" style={{ gridTemplateColumns: "1fr" }}>
            <h2>
              行動ボタン、<em>6案。</em>
            </h2>
            <p className="sub">
              店ページの「店舗、詳細。」の下のリンクの列を、SNS を含むボタンとして作り直した6案の見比べ（非公開・プレビュー専用）。
              実際の店ページでは <code>?sns=1</code>〜<code>?sns=6</code> で切り替えられます（例:{" "}
              <a href="/restaurant/r33?sns=6" style={{ textDecoration: "underline" }}>
                /restaurant/r33?sns=6
              </a>
              ）。
            </p>
            <p className="sub" style={{ marginTop: 8 }}>
              {VARIANTS.map((x, i) => (
                <span key={x.v}>
                  {i > 0 && "　"}
                  <a href={`#sa-v${x.v}`} style={{ textDecoration: "underline" }}>
                    {x.no} {x.name}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </section>

        {VARIANTS.map((x) => (
          <section className="article" key={x.v} id={`sa-v${x.v}`}>
            <div className="article-head" style={{ gridTemplateColumns: "1fr", paddingBottom: 24 }}>
              <h2>
                {x.no}、<em>{x.name}</em>
                <span style={{ font: "500 13px/1 var(--mono)", letterSpacing: ".3em", marginLeft: 16, color: "var(--ink-soft)" }}>{x.en}</span>
              </h2>
              <p className="sub" style={{ marginTop: 12 }}>
                {x.note}
              </p>
            </div>

            {loaded.map((s) => (
              <div key={s.id} style={{ marginTop: 56 }}>
                <p style={cap}>
                  実在の店｜{s.id}｜{s.shop.name}
                </p>
                <p style={why}>{STORES.find((q) => q.id === s.id)?.why}</p>
                <ShopActions
                  shop={s.shop}
                  storeId={s.id}
                  page="/proto-sns"
                  variant={x.v}
                  shareUrl={shareTarget(`/restaurant/${s.id}`)}
                  shareText={`${s.shop.name}｜マチノワ`}
                  bar={false}
                />
              </div>
            ))}

            <div style={{ marginTop: 72 }}>
              <p style={cap}>見本（リンク先は未登録）</p>
              <p style={why}>6種の SNS・公式サイトが全部そろった場合の見え方です。実在の店・アカウントではなく、押せません。</p>
              <ShopActions
                shop={SAMPLE}
                storeId="sample"
                page="/proto-sns"
                variant={x.v}
                shareUrl={shareTarget("/proto-sns")}
                shareText="見本"
                sample
                bar={false}
              />
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </div>
  );
}
