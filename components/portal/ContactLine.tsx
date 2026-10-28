import type { CSSProperties } from "react";

/**
 * 下の欄(フッター)に出す「お問い合わせ」の小さな 1 行(2026-10-29 オーナー決定「今の本番 /contact と同じアドレスでいい」)。
 * お問い合わせのページ・フォームは作らない。mailto のリンク 1 本だけ。色は置く先のフッターの文字色を引き継ぐ。
 * サーバー・クライアントのどちらからも使える。
 */
export const CONTACT_EMAIL = "linkateinc315@link8.info";

export function ContactLink({ className }: { className?: string }) {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={className} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
      お問い合わせ: {CONTACT_EMAIL}
    </a>
  );
}

const BASE: CSSProperties = { margin: "6px 0 0", fontSize: 11, lineHeight: 1.6, letterSpacing: "0.04em", opacity: 0.8 };

export default function ContactLine({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <p className={className} style={{ ...BASE, ...style }}>
      <ContactLink />
    </p>
  );
}
