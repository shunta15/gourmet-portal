/**
 * 編集部 /about の新しい見た目（サーバー）。字・リンク先は app/about/page.tsx の今の版と同じ。
 * regionCount: 「◯ 地域の街ごとの…」の数（呼び出し側が今までと同じ式で出す）。
 */
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";

export default function AboutView({ regionCount }: { regionCount: number }) {
  return (
    <PeripheryFrame newsletter>
      <Hero eyebrow="編集部" title={<>街と店を、<em>語る。</em></>} />

      <section className="rp-shelf" aria-label="編集部について" style={{ paddingTop: "clamp(8px, 1.6vw, 24px)" }}>
        <div className="pp-prose pf-rv">
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
            <a href="/editorial/guidelines" style={{ margin: "0 6px" }}>掲載基準</a>
            のページをご覧ください。お店からの掲載依頼・修正依頼は
            <a href="/contact" style={{ margin: "0 6px" }}>お問い合わせ</a>
            から。
          </p>
        </div>
      </section>

      <Sec id="pp-about-info" mark="編集部" title={null} k={1} label="編集部の情報">
        <dl className="rp-specs pp-specs">
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
      </Sec>
    </PeripheryFrame>
  );
}
