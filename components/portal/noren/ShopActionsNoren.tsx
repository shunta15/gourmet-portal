"use client";
/**
 * 店ページの行動ボタン（予約・電話・Google マップ・地図・SNS・公式サイト、ほかの店・特集記事への行き先、共有）。
 * 出すものと順番は、今の店ページ（components/portal/ShopActions）と同じ。lib/portal/shopActions.ts の buildActionModel が決めた一覧をそのまま描く。
 * 見た目だけ暖簾に合わせた（丸みのあるカプセル。予約か電話の最初の 1 つが朱）。
 */
import Link from "next/link";
import type { ActionModel, PrimaryAction } from "@/lib/portal/shopActions";
import { trackTap } from "@/lib/portal/track";
import { SaArrow, SaIcon, useShare } from "@/components/portal/ShopActionsParts";

const KIND: Record<PrimaryAction["id"], string> = {
  reserve: "予約サイトを開く",
  phone: "電話アプリで発信する",
  gmap: "Google マップで店の場所を開く",
  map: "このページの地図へ移動する",
  instagram: "店の Instagram を開く",
  tiktok: "店の TikTok を開く",
  x: "店の X を開く",
  facebook: "店の Facebook ページを開く",
  line: "店の LINE 公式アカウントを開く",
  website: "店の公式サイトを開く",
};
const label = (a: PrimaryAction) => (a.id === "gmap" ? "マップ" : a.short);
const SHARE_SHORT: Record<string, string> = { line: "LINE", x: "X", facebook: "Facebook" };

export default function ShopActionsNoren({
  model,
  storeId,
  page,
  shareUrl,
  shareText,
}: {
  model: ActionModel;
  storeId: string;
  page: string;
  shareUrl: string;
  shareText: string;
}) {
  const share = useShare({ url: shareUrl, text: shareText, storeId, page });
  return (
    <div className="vS-acts">
      {model.primary.length > 0 && (
        <ul>
          {model.primary.map((a) => (
            <li key={a.id}>
              <a
                href={a.href}
                {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`vS-act${a.hero ? " is-hero" : ""}`}
                aria-label={`${label(a)}（${KIND[a.id]}）${a.external ? "（外部サイトが新しいタブで開きます）" : ""}`}
                data-cursor={a.id === "phone" ? "CALL" : a.id === "reserve" ? "BOOK" : "GO"}
                onClick={() => {
                  if (a.tap) trackTap({ storeId, kind: a.tap, page });
                }}
              >
                <span className="dsc" aria-hidden="true">
                  <SaIcon name={a.icon} size={22} />
                </span>
                <span>{label(a)}</span>
                <span className="go" aria-hidden="true">
                  <SaArrow />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {model.secondary.length > 0 && (
        <div className="vS-sub">
          {model.secondary.map((s) => {
            const inner = (
              <>
                <span>{s.label}</span>
                <SaArrow />
              </>
            );
            return s.external ? (
              <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" data-cursor={s.cursor}>
                {inner}
                <span className="vN-vh">（外部サイトが新しいタブで開きます）</span>
              </a>
            ) : (
              <Link key={s.id} href={s.href} data-cursor={s.cursor}>
                {inner}
              </Link>
            );
          })}
        </div>
      )}

      <div className="vS-share" role="group" aria-label="この店を共有">
        <p className="cap" aria-hidden="true">共有</p>
        <ul>
          {share.items.map((it) => (
            <li key={it.id}>
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="vS-sh"
                aria-label={`${SHARE_SHORT[it.id]}で共有（外部サイトが新しいタブで開きます）`}
                onClick={() => share.tap(it.tap)}
              >
                <span className="dsc" aria-hidden="true">
                  <SaIcon name={it.icon} size={18} />
                </span>
                {SHARE_SHORT[it.id]}
              </a>
            </li>
          ))}
          <li>
            <button type="button" className={`vS-sh${share.copied ? " is-done" : ""}`} aria-label={share.copied ? "コピーしました" : "リンクをコピー"} onClick={share.copy}>
              <span className="dsc" aria-hidden="true">
                <SaIcon name={share.copied ? "check" : "link"} size={18} />
              </span>
              {share.copied ? "完了" : "コピー"}
            </button>
          </li>
        </ul>
        {share.manual && (
          <input ref={share.input} className="vS-share-url" type="text" readOnly value={share.url} aria-label="共有するURL" onFocus={(e) => e.currentTarget.select()} />
        )}
        <p className="vS-share-msg" role="status" aria-live="polite">
          {share.msg}
        </p>
      </div>
    </div>
  );
}
