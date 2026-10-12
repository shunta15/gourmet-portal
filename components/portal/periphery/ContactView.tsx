/**
 * お問い合わせ /contact の新しい見た目（サーバー）。字・リンク先（mailto）は app/contact/page.tsx の今の版と同じ。
 */
import PeripheryFrame from "./PeripheryFrame";
import { Dash, Hero, Sec } from "./parts";

export default function ContactView() {
  return (
    <PeripheryFrame newsletter>
      <Hero eyebrow="お問い合わせ" title={<>読者・店舗の、<em>窓口。</em></>} />

      <section className="rp-shelf" aria-label="メールでのお問い合わせ" style={{ paddingTop: "clamp(8px, 1.6vw, 24px)" }}>
        <p className="pp-lead2 pf-rv">
          読者・店舗オーナー様からのご連絡は、下記メールアドレスにてお受けしています。
        </p>
        <div className="pp-card pf-rv">
          <p className="pp-card__k">EMAIL</p>
          <a className="pp-card__mail" href="mailto:linkateinc315@link8.info">linkateinc315@link8.info</a>
        </div>
      </section>

      <Sec id="pp-contact-faq" mark="お問い合わせ" title="よくあるお問い合わせ" k={1}>
        <Dash
          items={[
            "新規掲載のご相談（店舗オーナー様）",
            "掲載内容の修正・更新依頼（営業時間・休業情報など）",
            "編集部へのフィードバック・記事提案",
            "取材依頼・タイアップに関するご相談",
          ]}
        />
        <p className="pp-note">
          返信には通常 2〜5 営業日いただいています。お急ぎの場合はメール本文に「お急ぎ」と明記ください。
        </p>
      </Sec>
    </PeripheryFrame>
  );
}
