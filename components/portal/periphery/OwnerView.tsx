/**
 * 店舗登録 /owner の新しい見た目（サーバー）。字・リンク先は app/owner/OwnerPortalLegacy.tsx（rest=false）・app/owner/page.tsx（rest=true）の今の版と同じ。
 * rest: RELEASE_REST の値（true: 「店舗登録」の版／false: 今の本番の「店舗オーナーポータル」の版）。
 */
import Link from "next/link";
import PeripheryFrame from "./PeripheryFrame";
import { Hero, Sec } from "./parts";

export default function OwnerView({ rest }: { rest: boolean }) {
  if (rest) {
    return (
      <PeripheryFrame>
        <Hero eyebrow="MACHINOWA" title="店舗登録" compact />
        <Sec id="pp-owner-h" mark="準備中" title="準備中" note="店舗の登録は、準備中です。" k={0}>
          <p className="pp-lead2">掲載についてのご相談は、お問い合わせからお寄せください。</p>
          <div className="pp-acts pp-tight">
            <Link href="/contact" className="pf-btn pf-btn--ghost">お問い合わせ</Link>
          </div>
        </Sec>
      </PeripheryFrame>
    );
  }
  // 今の本番の版（RELEASE_REST が false）。「更新申請をお受けします」「Day 22-23 で本格稼働予定」「申請の承認フロー（実装中）」など、実在しない申請・ポータルの機能に触れた文は、
  // 実在する連絡手段（メール。下の「現在の連絡先」）だけの言い方にした（新しい事実・連絡先は足していない。メールの文面は今のまま）。
  return (
    <PeripheryFrame>
      <Hero
        eyebrow="MACHINOWA"
        title="店舗オーナーポータル"
        lead="掲載店舗のオーナー様向けのページです。営業時間・写真・お知らせの修正のご連絡は、メールでお受けしています。"
        compact
      />
      <Sec id="pp-owner-h" mark="準備中" title="準備中" note="このページは準備中です。" k={0} />
      <Sec id="pp-owner-c" mark="現在の連絡先" title="現在の連絡先" note="下記からご連絡ください" k={1}>
        <p className="pp-lead2">
          掲載情報の修正依頼・写真差し替え・新規掲載のご相談はマチノワ編集部までメールで受け付けています。
        </p>
        <div className="pp-acts pp-tight">
          <a href="mailto:linkateinc315@link8.info" className="pf-btn pf-btn--ghost">linkateinc315@link8.info</a>
        </div>
      </Sec>
    </PeripheryFrame>
  );
}
