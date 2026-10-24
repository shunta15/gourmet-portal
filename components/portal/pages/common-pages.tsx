/**
 * サイト共通ページ（編集部について・掲載基準・お問い合わせ・店舗登録）の本体（サーバー）。
 * 枠は components/portal/pages/CommonShell（総合サイトの共通の枠）。字・リンク先は app/{about,contact,owner,editorial/guidelines}/page.tsx の
 * 周りのページ版（components/portal/periphery/{About,Contact,Guidelines,Owner}View.tsx）と同じ（公開スイッチ OFF のとき従来のまま出る版）。
 * ページ上部（パンくず・見出し）は、動画 /videos と同じ PageFrame。
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Block, PageFrame, type Tone } from "./frame";

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "" };
const HOME = { name: "マチノワ", href: "/" };

function Body({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mp-pg-sec" aria-label={label}>
      <div className="mp-wrap">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mp-cm-list">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

/** 編集部について /about */
export function CommonAbout({ regionCount }: { regionCount: number }) {
  return (
    <PageFrame
      tone={{ ...TONE, glyph: "編" }}
      crumbs={[HOME, { name: "編集部について", href: "/about" }]}
      kicker="編集部"
      heading="街と店を、語る。"
    >
      <Body label="編集部について">
        <div className="mp-cm-prose">
          <p>
            「マチノワ／街の輪」は、日本の街と店を語るオンライン誌です。
            一軒の店を、街の文脈と一緒に紹介する。
            「ガイド」ではなく「読みもの」として、編集部の体温が伝わる紙面を目指しています。
          </p>
          <p>
            扱うのは、地元の人がふだん使いする一軒から、観光で立ち寄りたい老舗、新しいカルチャーを背負う場まで。
            {" "}
            {regionCount} 地域の街ごとのミニポータルと、利用シーン別のセレクトを軸に編成しています。
          </p>
          <p>
            記事には事実情報のみを載せ、誇張・推測・虚偽は使いません。
            営業時間や料金など変動する情報は「訪問前に公式確認」と明記し、読者にも実態を一緒に追ってもらえる紙面に。
          </p>
          <p>
            掲載基準・編集方針については
            <Link href="/editorial/guidelines">掲載基準</Link>
            のページをご覧ください。お店からの掲載依頼・修正依頼は
            <Link href="/contact">お問い合わせ</Link>
            から。
          </p>
        </div>
      </Body>
      <Body label="編集部の情報">
        <dl className="mp-cm-dl">
          <div>
            <dt>発行</dt>
            <dd>マチノワ編集部</dd>
          </div>
          <div>
            <dt>拠点</dt>
            <dd>日本 全国</dd>
          </div>
          <div>
            <dt>連絡先</dt>
            <dd>linkateinc315@link8.info</dd>
          </div>
        </dl>
      </Body>
    </PageFrame>
  );
}

/** お問い合わせ /contact */
export function CommonContact() {
  return (
    <PageFrame
      tone={{ ...TONE, glyph: "問" }}
      crumbs={[HOME, { name: "お問い合わせ", href: "/contact" }]}
      kicker="お問い合わせ"
      heading="読者・店舗の、窓口。"
    >
      <Body label="メールでのお問い合わせ">
        <div className="mp-cm-prose">
          <p>読者・店舗オーナー様からのご連絡は、下記メールアドレスにてお受けしています。</p>
        </div>
        <div className="mp-cm-card">
          <p className="k">EMAIL</p>
          <a href="mailto:linkateinc315@link8.info">linkateinc315@link8.info</a>
        </div>
      </Body>
      <Block id="mp-cm-faq" kicker="FAQ" title="よくあるお問い合わせ">
        <List
          items={[
            "新規掲載のご相談（店舗オーナー様）",
            "掲載内容の修正・更新依頼（営業時間・休業情報など）",
            "編集部へのフィードバック・記事提案",
            "取材依頼・タイアップに関するご相談",
          ]}
        />
        <p className="mp-cm-note">
          返信には通常 2〜5 営業日いただいています。お急ぎの場合はメール本文に「お急ぎ」と明記ください。
        </p>
      </Block>
    </PageFrame>
  );
}

/** 掲載基準 /editorial/guidelines（節の題・箇条は app/editorial/guidelines/page.tsx の SECTIONS を受け取る） */
export function CommonGuidelines({ sections }: { sections: { title: string; body: string[] }[] }) {
  return (
    <PageFrame
      tone={{ ...TONE, glyph: "基" }}
      crumbs={[HOME, { name: "掲載基準", href: "/editorial/guidelines" }]}
      kicker="掲載基準"
      heading="編集の、約束事。"
    >
      {sections.map((s, i) => (
        <Block key={i} id={`mp-cm-gl-${i}`} kicker={`Guideline ${String(i + 1).padStart(2, "0")}`} title={s.title}>
          <List items={s.body} />
        </Block>
      ))}
      <Body label="更新について">
        <p className="mp-cm-note" style={{ marginTop: 0 }}>
          編集方針は読者・店舗からのフィードバックを受けて随時更新します。 最終更新: 2026 年 5 月
        </p>
      </Body>
    </PageFrame>
  );
}

/** 店舗登録 /owner。rest: RELEASE_REST の値（true: 「店舗登録」の版／false: 今の本番の「店舗オーナーポータル」の版） */
export function CommonOwner({ rest }: { rest: boolean }) {
  if (rest) {
    return (
      <PageFrame tone={{ ...TONE, glyph: "登" }} crumbs={[HOME, { name: "店舗登録", href: "/owner" }]} kicker="MACHINOWA" heading="店舗登録">
        <Block id="mp-cm-owner" kicker="Status" title="準備中">
          <div className="mp-cm-prose">
            <p>店舗の登録は、準備中です。</p>
            <p>掲載についてのご相談は、お問い合わせからお寄せください。</p>
          </div>
          <div className="mp-cm-acts">
            <Link href="/contact" className="mp-btn ghost">お問い合わせ</Link>
          </div>
        </Block>
      </PageFrame>
    );
  }
  return (
    <PageFrame
      tone={{ ...TONE, glyph: "登" }}
      crumbs={[HOME, { name: "店舗オーナーポータル", href: "/owner" }]}
      kicker="MACHINOWA"
      heading="店舗オーナーポータル"
      lead="掲載店舗のオーナー様向けのページです。営業時間・写真・お知らせの修正のご連絡は、メールでお受けしています。"
    >
      <Block id="mp-cm-owner" kicker="Status" title="準備中">
        <div className="mp-cm-prose">
          <p>このページは準備中です。</p>
        </div>
      </Block>
      <Block id="mp-cm-owner-c" kicker="Contact" title="現在の連絡先">
        <div className="mp-cm-prose">
          <p>下記からご連絡ください</p>
          <p>掲載情報の修正依頼・写真差し替え・新規掲載のご相談はマチノワ編集部までメールで受け付けています。</p>
        </div>
        <div className="mp-cm-card">
          <p className="k">EMAIL</p>
          <a href="mailto:linkateinc315@link8.info">linkateinc315@link8.info</a>
        </div>
      </Block>
    </PageFrame>
  );
}
