import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import ArticleShell from "./ArticleShell";
import { Sec, P, Note, Checks, Arrow, Leaf } from "./parts";
import { CountUp } from "../common/Motion";
import { ShopPhoto } from "../common/ShopCard";
import { BASE, SEARCH_HREF, SPECIAL_HREF, searchHref, shopHref, specialHref } from "../common/site";
import { kindIsDark } from "@/lib/portal/vert/bodygreen/shops";
import { dotDate, loadSpecialStats, type SpecialStats, type WeekendShop } from "@/lib/portal/vert/bodygreen/specialData";
import { SOURCES, SOURCES_CHECKED_AT_DOT, SPECIALS, specialBySlug, type SpecialMeta, type SpecialSlug } from "@/lib/portal/vert/bodygreen/special";

/**
 * 業種の特集記事 3 本(/bodycare/special/[slug])。見た目は案4 の記事の型(ArticleShell)。
 * 書くのは「出典で確かめた事実」と「店のデータにある事実」だけ。件数は loadSpecialStats() でビルド時に数える(本文に直書きしない)。
 * 写真は実在の店の写真(土日の記事の見出しの写真だけ)。ほかは装飾(若葉・種類の色の札・線のアイコン)。
 */

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;

const ChipIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <path d="M12 3l7 2.6v5.7c0 4.6-3 8.2-7 9.7-4-1.5-7-5.1-7-9.7V5.6z" fill="currentColor" />
    <path d="M8.8 11.8l2.2 2.2 4.2-4.4" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoctorNote = () => (
  <Note>
    しびれや強い痛みが続くとき、けがの直後、からだの状態が急に変わったときは、まず医療機関に相談してください。この記事は一般的な情報です。診断や施術の代わりにはならず、施術や店の結果をお約束するものでもありません。
  </Note>
);

/** 右の追従カード(内容の一覧+探すへの導線+一言) */
function Aside({ meta, small }: { meta: SpecialMeta; small: string }) {
  return (
    <div className="ar-card" data-rv="right">
      <h2 className="ar-card-h gr-vbar">このページの内容</h2>
      <nav className="ar-mini" aria-label="内容">
        {meta.points.map((x) => (
          <a key={x.id} href={`#${x.id}`} className="gr-hov">
            <span className="no">{x.no}</span>
            <span style={{ flex: 1 }}>{x.title}</span>
            <span className="gr-arrow" style={{ width: 22, height: 22 }}>
              <Arrow />
            </span>
          </a>
        ))}
      </nav>
      <div className="ar-cta">
        <Link href={SEARCH_HREF} className="gr-btn gr-press gr-shimmer">
          店を探す
          <Arrow />
        </Link>
      </div>
      <p className="ar-small">{small}</p>
    </div>
  );
}

/** あわせて読む(ほかの 2 本)。写真は使わず、緑の面+若葉 */
function Related({ current }: { current: SpecialSlug }) {
  return (
    <>
      {SPECIALS.filter((s) => s.slug !== current).map((s) => (
        <div key={s.slug} data-rv>
          <Link href={specialHref(s.slug)} className="ar-rc ar-rc--plain gr-lift gr-hov">
            <div className="ph">
              <Leaf size={44} />
            </div>
            <div className="tx">
              <small>特集記事</small>
              <h3>{s.title}</h3>
              <p>{s.summary}</p>
            </div>
            <span className="gr-arrow">
              <Arrow />
            </span>
          </Link>
        </div>
      ))}
    </>
  );
}

const BACK = [
  { label: "最初のページへ", href: BASE },
  { label: "探すページへ", href: SEARCH_HREF, primary: true },
  { label: "特集記事の一覧へ", href: SPECIAL_HREF },
];

function crumbs(meta: SpecialMeta) {
  return [{ label: "マチノワ ボディケア", href: BASE }, { label: "特集記事", href: SPECIAL_HREF }, { label: meta.title }];
}

/** 出典の台帳(記事の終わり)。どの文の根拠かと、確かめた日を出す */
function SourceList({ meta }: { meta: SpecialMeta }) {
  if (meta.sourceIds.length === 0) return null;
  return (
    <section className="ar-src" id="sources" data-rv>
      <h2 className="ar-src-h gr-vbar">出典</h2>
      <p className="ar-src-d">出典のページを開き、書いてある内容を確かめた日: {SOURCES_CHECKED_AT_DOT}。法令や案内は改められることがあります。最新の内容は出典のページで確かめてください。</p>
      <ol>
        {meta.sourceIds.map((id) => {
          const s = SOURCES[id];
          return (
            <li key={id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="gr-hov">
                {s.label}
              </a>
              <span>{s.confirmed}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ 見出しの右の組(装飾) */

function KindTiles({ stats }: { stats: SpecialStats }) {
  return (
    <div className="ar-sv ar-sv-kinds">
      {stats.facets.kinds.map((k, i) => (
        <div
          key={k.slug}
          className={`ar-ph ar-kt gr-float${kindIsDark(k.slug) ? " is-dark" : ""}`}
          data-rv="zoom"
          style={{ ...d(120 + i * 110), ["--kc" as string]: k.color, animationDelay: `${i * -0.9}s` } as CSSProperties}
        >
          <Leaf size={20} className="gr-sway" />
          <b>{k.name}</b>
          <small>掲載 {k.count}店</small>
        </div>
      ))}
    </div>
  );
}

const ICONS: Record<string, ReactNode> = {
  pin: (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path className="gr-draw" d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <circle className="gr-draw" cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path className="gr-draw" d="M7 3.5h3l1.4 4-2 1.3a10 10 0 0 0 5 5l1.3-2 4 1.4v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path className="gr-draw" d="M12 3l7 2.6v5.7c0 4.6-3 8.2-7 9.7-4-1.5-7-5.1-7-9.7V5.6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.8 11.8l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function IconTiles() {
  const items = [
    { ic: "pin", t: "場所" },
    { ic: "clock", t: "営業時間・定休日" },
    { ic: "phone", t: "予約のしかた" },
    { ic: "shield", t: "免許の表示" },
  ];
  return (
    <div className="ar-sv ar-sv-icons">
      {items.map((x, i) => (
        <div key={x.t} className="ar-ph ar-it gr-float" data-rv="zoom" style={{ ...d(120 + i * 120), animationDelay: `${i * -1.1}s` } as CSSProperties}>
          <span className="c">{ICONS[x.ic]}</span>
          <b>{x.t}</b>
        </div>
      ))}
    </div>
  );
}

/** 土日の記事の見出しの写真(実在の店の写真。土日も開いている店のうち写真のある最初の 3 店。店名と店ページへのリンク付き) */
function PhotoTiles({ stats }: { stats: SpecialStats }) {
  const withPhoto = stats.weekend.filter((w) => w.shop.photo).slice(0, 3);
  return (
    <div className={`ar-sv ar-sv-photos n${withPhoto.length}`}>
      {withPhoto.map(({ shop }, i) => (
        <Link key={shop.id} href={shopHref(shop.id)} className={`ar-ph ar-pt p${i} gr-zoom`} data-rv="zoom" style={d(120 + i * 140)}>
          <ShopPhoto shop={shop} eager={i === 0} sizes="(min-width: 960px) 300px, 60vw" />
          <span className="cap">
            <span>{shop.name}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ カード(呼び名・保険) */

type WordCardProps = {
  name: string;
  sub?: string;
  color: string;
  dark?: boolean;
  lic?: { ok: boolean; text: string };
  rows: Array<[string, string]>;
};

function WordCard({ name, sub, color, dark, lic, rows }: WordCardProps) {
  return (
    <li className="ar-word gr-lift gr-hov" data-rv>
      <div className={`face${dark ? " is-dark" : ""}`} style={{ ["--kc" as string]: color } as CSSProperties}>
        <b>{name}</b>
        {sub && <small>{sub}</small>}
      </div>
      <div className="tx">
        {lic && <span className={`ar-lic ${lic.ok ? "y" : "n"}`}>{lic.text}</span>}
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ 記事 a: 呼び名のちがい */

function DifferenceArticle({ stats }: { stats: SpecialStats }) {
  const meta = specialBySlug("difference")!;
  const kind = (slug: string) => stats.facets.kinds.find((k) => k.slug === slug);
  const color = (slug: string) => kind(slug)?.color ?? "#cfd8c8";
  const dark = (slug: string) => kindIsDark(slug);
  const nameOf = (slug: string, fallback: string) => kind(slug)?.name ?? fallback;
  const countOf = (slug: string) => kind(slug)?.count;
  const sub = (slug: string) => (countOf(slug) != null ? `マチノワの分類 ${countOf(slug)}店` : undefined);

  return (
    <ArticleShell
      kind="special"
      crumbs={crumbs(meta)}
      chip={
        <>
          <ChipIcon />
          特集記事
        </>
      }
      title={meta.titleLines}
      sub="名前によって、関わる法律の決まりがちがいます"
      date={`出典の確認日 ${SOURCES_CHECKED_AT_DOT}`}
      read="読むのにかかる時間 約5分"
      lead="店の看板や紹介ページには、似た名前がいくつも並びます。名前によって、関わる法律の決まりがちがいます。ただし名前だけでは、施術する人の免許は分かりません。ここでは、法令と国の資料で確かめられたことだけを整理します。"
      vis={<KindTiles stats={stats} />}
      note={["呼び名のちがいを、", "ひとつずつ。"]}
      badge={["資料で", "確かめた", "ことだけ"]}
      pointsTitle="この記事の内容"
      points={meta.points}
      aside={<Aside meta={meta} small="この記事は一般的な情報です。診断や施術の代わりにはなりません。出典は記事の終わりにまとめています。" />}
      related={<Related current="difference" />}
      back={BACK}
      after={<SourceList meta={meta} />}
    >
      <Sec id="license" no="01" title="法律で免許が決められている業">
        <P>
          名前だけでは、施術する人の免許の有無は分かりません。厚生労働省は、あん摩マッサージ指圧師、はり師、きゅう師の免許のある人とない人の判別が困難であることが指摘されている、としています。国民生活センターも、免許のある人による施術かどうかは広告を見ただけでは判断が難しい場合がある、と述べています。
        </P>
        <div className="ar-two" data-rv-group>
          <div data-rv>
            <h3>法律で免許が決められている</h3>
            <ul>
              <li>あん摩マッサージ指圧師</li>
              <li>はり師</li>
              <li>きゅう師</li>
              <li>柔道整復師</li>
            </ul>
          </div>
          <div data-rv>
            <h3>確かめた法律に、名前が出てこない呼び名</h3>
            <ul>
              <li>整体</li>
              <li>リラクゼーション</li>
            </ul>
          </div>
        </div>
        <P>
          あん摩マッサージ指圧師、はり師、きゅう師等に関する法律(第1条)は、医師以外の人が、あん摩、マッサージ、指圧、はり、きゅうを業として行うには、それぞれの免許を受けなければならないと定めています。柔道整復師法(第2条)は、柔道整復師を「厚生労働大臣の免許を受けて、柔道整復を業とする者」と定めています。
        </P>
        <P>整体については、国民生活センターが2012年8月の報道発表で、整体やカイロプラクティックなどには法的な資格制度がない、と述べています。</P>
      </Sec>

      <Sec id="words" no="02" title="五つの呼び名と、法律のうえでの決まり">
        <div className="ar-count" data-rv>
          <b>
            <CountUp to={5} />
          </b>
          <span>つの呼び名を並べて見ます</span>
        </div>
        <ul className="ar-words" data-rv-group>
          <WordCard
            name={nameOf("seitai", "整体")}
            sub={sub("seitai")}
            color={color("seitai")}
            dark={dark("seitai")}
            lic={{ ok: false, text: "法的な資格制度なし(国民生活センター)" }}
            rows={[
              ["免許", "整体という呼び名の免許は、確かめた2つの法律に定められていません。"],
              ["国の資料", "同じ報道発表は、こうした施術者の技術の水準や施術の方法がばらばらな状況にあることが指摘されている、としています。"],
            ]}
          />
          <WordCard
            name={nameOf("sekkotsu", "整骨院・接骨院")}
            sub={sub("sekkotsu")}
            color={color("sekkotsu")}
            dark={dark("sekkotsu")}
            lic={{ ok: true, text: "免許が必要な業(柔道整復師)" }}
            rows={[
              ["免許", "柔道整復を業として行うには、柔道整復師の免許が必要です(柔道整復師法 第15条。医師を除く)。名前が整骨院・接骨院でも、施術する人の免許は店で確かめます。"],
              ["決まり", "脱臼や骨折の患部への施術は、医師の同意を得た場合のほか、してはならないと定められています。応急手当は除かれます(同法 第17条)。"],
            ]}
          />
          <WordCard
            name={nameOf("shinkyu", "鍼灸院")}
            sub={sub("shinkyu")}
            color={color("shinkyu")}
            dark={dark("shinkyu")}
            lic={{ ok: true, text: "免許が必要な業(はり師・きゅう師)" }}
            rows={[
              ["免許", "はり(鍼)を業として行うにははり師、きゅう(灸)を業として行うにはきゅう師の免許が必要です(あん摩マッサージ指圧師、はり師、きゅう師等に関する法律 第1条。医師を除く)。名前が鍼灸院でも、施術する人の免許は店で確かめます。"],
              ["健康保険", "条件つきで使える場合があります。「健康保険が使える場合」で説明します。"],
            ]}
          />
          <WordCard
            name={nameOf("massage", "マッサージ")}
            sub={sub("massage")}
            color={color("massage")}
            dark={dark("massage")}
            lic={{ ok: true, text: "免許が必要な業(あん摩マッサージ指圧師)" }}
            rows={[
              ["免許", "あん摩・マッサージ・指圧を業として行うには、あん摩マッサージ指圧師の免許が必要です(同法 第1条。医師を除く)。名前がマッサージでも、施術する人の免許は店で確かめます。"],
              ["確かめ方", "施術する人の免許が、店のページや店内の表示に書かれているかを見ます。"],
            ]}
          />
          <WordCard
            name={nameOf("relaxation", "リラクゼーション")}
            sub={sub("relaxation")}
            color={color("relaxation")}
            dark={dark("relaxation")}
            lic={{ ok: false, text: "確かめた法律に名前なし" }}
            rows={[
              ["免許", "「リラクゼーション」は、確かめた2つの法律に出てくる呼び名ではありません。"],
              ["内容", "メニューの中身は店によってちがいます。メニューの説明で確かめます。"],
            ]}
          />
        </ul>
      </Sec>

      <Sec id="insurance" no="03" title="健康保険が使える場合">
        <P>整骨院・接骨院、鍼灸院、マッサージで健康保険(療養費)が使えるのは、決められた場合だけです。厚生労働省の案内では、次のとおりです。</P>
        <ul className="ar-words" data-rv-group>
          <WordCard
            name="柔道整復"
            sub="整骨院・接骨院"
            color="#e4ecdd"
            rows={[
              ["使える場合", "骨折、脱臼、打撲、捻挫(いわゆる肉ばなれを含む)の施術を受けたとき。"],
              ["注意", "骨折と脱臼は、緊急の場合を除き、あらかじめ医師の同意が必要です。単なる肩こり、筋肉疲労などへの施術は保険の対象にならず、全額が自己負担になります。同じけがで病院や診療所にかかっている間は、保険の対象になりません。"],
            ]}
          />
          <WordCard
            name="はり・きゅう"
            sub="鍼灸院"
            color="#e4ecdd"
            rows={[
              ["使える場合", "主として神経痛、リウマチ、頸腕症候群、五十肩、腰痛症、頸椎捻挫後遺症などの、慢性的な疼痛を主な症状とする病気で施術を受けたとき。"],
              ["注意", "あらかじめ医師の発行した同意書または診断書が必要です。詳しくは、はり・きゅう施術所などに尋ねるよう案内されています。同じ病気で病院や診療所にかかっている間は、保険の対象になりません。"],
            ]}
          />
          <WordCard
            name="マッサージ"
            color="#e4ecdd"
            rows={[
              ["使える場合", "筋麻痺や関節拘縮などで、医療上マッサージを必要とする場合。"],
              ["注意", "あらかじめ医師の発行した同意書または診断書が必要です。詳しくは、マッサージ施術所などに尋ねるよう案内されています。疲労回復や慰安が目的のもの、病気の予防のためのマッサージは、保険の対象になりません。"],
            ]}
          />
        </ul>
        <Note>あらかじめ医師の同意書または診断書が要るのは、はり・きゅうとマッサージです。柔道整復で医師の同意が要るのは、骨折と脱臼です(緊急の場合を除く)。</Note>
      </Sec>

      <Sec id="listed" no="04" title="掲載している店の種類">
        <P>マチノワボディケアには、{stats.total}店が載っています。種類ごとの店の数は、次のとおりです。</P>
        <ul className="ar-kinds" data-rv-group>
          {stats.facets.kinds.map((k) => (
            <li key={k.slug} data-rv>
              <Link href={searchHref({ kind: k.slug })} className="ar-kind gr-lift gr-hov" style={{ ["--kc" as string]: k.color } as CSSProperties}>
                <i aria-hidden="true" />
                <b>{k.name}</b>
                <span>
                  <em>{k.count}</em>店
                </span>
                <span className="gr-arrow">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Note>ここでの種類は、マチノワがお店を並べるための分け方です。免許の有無を示すものではありません。施術する人の免許は、各店のページや公式サイトで確かめてください。</Note>
      </Sec>

      <Sec id="doctor" no="05" title="医療機関に相談する目安">
        <P>
          しびれや強い痛みが続くとき、けがの直後、からだの状態が急に変わったときは、まず医療機関に相談してください。整体・整骨院・鍼灸院・マッサージ・リラクゼーションは、医師の診断に代わるものではありません。
        </P>
        <P>
          国民生活センターは2012年の報道発表で、病気やからだの不調がある人は、手技の施術を受ける前に医師のアドバイスを受けること、医師の診断を受けている病気は施術者にあらかじめ伝えること、重い症状が出たときは速やかに医療機関を受診することを呼びかけています。
        </P>
        <DoctorNote />
      </Sec>
    </ArticleShell>
  );
}

/* ------------------------------------------------------------------ 記事 b: 選ぶときに見るところ */

function ChooseArticle({ stats }: { stats: SpecialStats }) {
  const meta = specialBySlug("choose")!;
  const t = (name: string) => stats.tag[name] ?? 0;
  return (
    <ArticleShell
      kind="special"
      crumbs={crumbs(meta)}
      chip={
        <>
          <ChipIcon />
          特集記事
        </>
      }
      title={meta.titleLines}
      sub="店のページで確かめられることだけ"
      date={`出典の確認日 ${SOURCES_CHECKED_AT_DOT}`}
      read="読むのにかかる時間 約4分"
      lead={`ボディケアの店を選ぶとき、見るところは店のページに並んでいます。場所、営業時間と定休日、予約のしかた、施術する人の免許。マチノワに載っている${stats.total}店の情報で、確かめられる見かたを整理しました。`}
      vis={<IconTiles />}
      note={["見るところは、", "店のページに。"]}
      badge={["確かめられる", "見かた"]}
      pointsTitle="この記事の内容"
      points={meta.points}
      aside={<Aside meta={meta} small="件数は、マチノワに載っている店のデータを数えたものです。順位や評価ではありません。" />}
      related={<Related current="choose" />}
      back={BACK}
      after={<SourceList meta={meta} />}
    >
      <Sec id="place" no="01" title="場所と営業時間・定休日">
        <P>
          店のページには住所と、地図を開くリンクがあります。マチノワに載っている{stats.total}店のうち、住所が載っているのは{stats.withAddress}店、地図のリンクがあるのは{stats.withMap}店です。
        </P>
        <Checks
          items={[
            { t: "営業時間", d: `営業時間が載っているのは${stats.withHours}店です。昼と夕方で時間が分かれている店や、曜日で時間がちがう店もあるので、行きたい曜日と時間を先に見ます。` },
            { t: "定休日", d: `定休日が載っているのは${stats.withHolidays}店です。休みの曜日は店によってちがいます。` },
            { t: "こだわりのタグ", d: `『駅近』が付いた店は${t("駅近")}店、『夜遅くまで営業』が付いた店は${t("夜遅くまで営業")}店、『土日営業』が付いた店は${t("土日営業")}店です。` },
          ]}
        />
        <P>
          土曜・日曜に行ける店は、
          <Link href={specialHref("weekend")} className="ar-a">
            「土日も開いているボディケアの店」
          </Link>
          にまとめています。
        </P>
      </Sec>

      <Sec id="reserve" no="02" title="予約のしかた">
        <Checks
          items={[
            { t: "電話", d: `電話番号が載っているのは${stats.withPhone}店です。` },
            { t: "予約ページ", d: `予約ページが用意されている店は${stats.withReservation}店です。` },
            { t: "公式サイト", d: `公式サイトが載っている店は${stats.withWebsite}店です。メニューや予約の案内を公式サイトで確かめられることがあります。` },
            { t: "予約なしで行けるか", d: `『予約なし可』が付いた店は${t("予約なし可")}店です。ほかの店は、予約が必要かどうかが分からないことがあるので、行く前に電話か予約ページで確かめます。` },
          ]}
        />
      </Sec>

      <Sec id="qualify" no="03" title="施術する人の免許の表示">
        <P>
          あん摩マッサージ指圧師、はり師、きゅう師、柔道整復師には国家資格があり、法律で免許が決められています。厚生労働省は、あん摩マッサージ指圧師、はり師、きゅう師の免許のある人とない人の判別が困難であることが指摘されている、としています。店のページや公式サイト、店内の表示に、施術する人の免許が書かれているかを見ます。
        </P>
        <P>
          書かれていないことだけで、免許がないとは言えません。気になるときは、行く前に店へ尋ねます。呼び名ごとの免許のちがいは、
          <Link href={specialHref("difference")} className="ar-a">
            「整体・整骨院・鍼灸院・マッサージ・リラクゼーションのちがい」
          </Link>
          にまとめています。
        </P>
      </Sec>

      <Sec id="source" no="04" title="情報の出どころと確認日">
        <P>
          店のページには、情報の出どころ(公式サイトや Google マップなど)と確認日を載せています。出どころが載っている店は{stats.withSources}店、確認日が載っている店は{stats.withCheckedAt}店です
          {stats.checkedAtMin ? `(いちばん古い確認日は${dotDate(stats.checkedAtMin)})` : ""}。営業時間や定休日は変わることがあります。出かける前に、公式サイトか電話で確かめてください。
        </P>
      </Sec>

      <Sec id="doctor" no="05" title="医療機関に相談する目安">
        <P>
          しびれや強い痛みが続くとき、けがの直後、からだの状態が急に変わったときは、まず医療機関に相談してください。国民生活センターは2012年の報道発表で、病気やからだの不調がある人は、手技の施術を受ける前に医師のアドバイスを受けるよう呼びかけています。
        </P>
        <DoctorNote />
      </Sec>
    </ArticleShell>
  );
}

/* ------------------------------------------------------------------ 記事 c: 土日も開いている店 */

function WeekendShopRow({ w }: { w: WeekendShop }) {
  const { shop } = w;
  const hours = w.sat === w.sun ? [["土・日", w.sat]] : [["土", w.sat], ["日", w.sun]];
  const tags = shop.tags.filter((x) => x !== "土日営業").slice(0, 2);
  return (
    <li data-rv>
      <article className="ar-wk gr-lift gr-hov">
        <div className="ph">
          <ShopPhoto shop={shop} sizes="(min-width: 960px) 200px, 112px" />
        </div>
        <div className="mid">
          <h3>
            <Link href={shopHref(shop.id)} className="ar-wk-a">
              {shop.name}
            </Link>
          </h3>
          <p className="ad">{shop.area}</p>
          <ul className="tg">
            <li className="k">{shop.kindName}</li>
            {tags.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <dl className="hr">
          {hours.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          {w.holidays && (
            <div>
              <dt>定休日</dt>
              <dd>{w.holidays}</dd>
            </div>
          )}
        </dl>
        <span className="gr-arrow ar-wk-go" aria-hidden="true">
          <Arrow />
        </span>
      </article>
    </li>
  );
}

function WeekendArticle({ stats }: { stats: SpecialStats }) {
  const meta = specialBySlug("weekend")!;
  const n = stats.weekend.length;
  // 都道府県ごとの店の数(並びは都道府県順 → ID 順のまま)
  const prefs: Array<{ name: string; count: number }> = [];
  for (const w of stats.weekend) {
    const last = prefs[prefs.length - 1];
    if (last && last.name === w.shop.prefName) last.count += 1;
    else prefs.push({ name: w.shop.prefName, count: 1 });
  }
  const prefLine = prefs.map((p) => `${p.name}${p.count}店`).join("、");
  const reserveFree = stats.weekend.filter((w) => w.shop.tags.includes("予約なし可")).length;
  const tagged = stats.weekend.filter((w) => w.shop.tags.includes("土日営業")).length;
  const tagAll = stats.tag["土日営業"] ?? 0;

  return (
    <ArticleShell
      kind="special"
      crumbs={crumbs(meta)}
      chip={
        <>
          <ChipIcon />
          特集記事
        </>
      }
      title={meta.titleLines}
      sub={`土曜と日曜の営業時間がある${n}店を、店のデータのとおりに`}
      date={stats.checkedAtMin ? `店の情報の確認日 ${dotDate(stats.checkedAtMin)}〜` : undefined}
      read="読むのにかかる時間 約3分"
      lead="平日は行けない人のために、営業時間に土曜と日曜の両方がある店を集めました。土曜・日曜の営業時間と定休日は、店のデータにあるとおりに写しています。並びは都道府県順で、順位ではありません。"
      vis={<PhotoTiles stats={stats} />}
      note={["土日に行ける店を、", "ならべました。"]}
      badge={["営業時間は", "店のデータの", "とおり"]}
      pointsTitle="この記事の内容"
      points={meta.points}
      aside={<Aside meta={meta} small="営業時間や定休日は変わることがあります。出かける前に、店のページの確認日と公式サイトで確かめてください。" />}
      related={<Related current="weekend" />}
      back={BACK}
    >
      <Sec id="list" no="01" title="土曜・日曜の営業時間">
        <div className="ar-count" data-rv>
          <b>
            <CountUp to={n} />
          </b>
          <span>店({prefLine})</span>
        </div>
        <ul className="ar-wks" data-rv-group>
          {stats.weekend.map((w) => (
            <WeekendShopRow key={w.shop.id} w={w} />
          ))}
        </ul>
      </Sec>

      <Sec id="before" no="02" title="出かける前に">
        <Checks
          items={[
            { t: "営業時間と定休日は変わることがあります", d: "店のページの下にある確認日と、公式サイトの案内を見比べます。" },
            { t: "予約が必要かどうか", d: reserveFree > 0 ? `『予約なし可』が付いているのは、この${n}店のうち${reserveFree}店です。ほかの店は、行く前に電話か予約ページで確かめます。` : "予約が必要かどうかは、行く前に電話か予約ページで確かめます。" },
            { t: "載せた店の決めかた", d: "店の営業時間の行に、土曜と日曜の両方の時間がある店だけを載せました。定休日に土曜・日曜が入っている店や、営業時間の書き方を読み取れない店は載せていません。" },
            { t: "営業時間が分かれている店", d: "営業時間が複数の時間帯に分かれている店もあります。店のページの営業時間を、そのまま見てください。" },
          ]}
        />
      </Sec>

      <Sec id="doctor" no="03" title="医療機関に相談する目安">
        <P>しびれや強い痛みが続くとき、けがの直後、からだの状態が急に変わったときは、土日でも、まず医療機関に相談してください。</P>
        <DoctorNote />
      </Sec>

      <Sec id="more" no="04" title="ほかの条件で探す">
        <P>
          探すページでは、種類・都道府県・こだわり・キーワードで店を絞れます。『土日営業』は、こだわりから選べます。{tagAll > 0 && tagged === tagAll ? `『土日営業』のこだわりが付いた${tagAll}店は、すべてこの記事に載っています。` : ""}
        </P>
        <div className="ar-cta ar-cta--row">
          <Link href={searchHref({ tag: "土日営業" })} className="gr-btn gr-press gr-shimmer">
            『土日営業』の店を探す
            <Arrow />
          </Link>
          <Link href={specialHref("choose")} className="gr-btn gr-btn--line gr-press">
            店を選ぶときに見るところ
            <Arrow />
          </Link>
        </div>
      </Sec>
    </ArticleShell>
  );
}

/* ------------------------------------------------------------------ 入口 */

export default async function SpecialArticle({ slug }: { slug: SpecialSlug }) {
  const stats = await loadSpecialStats();
  if (slug === "difference") return <DifferenceArticle stats={stats} />;
  if (slug === "choose") return <ChooseArticle stats={stats} />;
  return <WeekendArticle stats={stats} />;
}
