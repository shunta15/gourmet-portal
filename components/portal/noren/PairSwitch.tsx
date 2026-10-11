import Link from "next/link";
import "@/app/proto-noren/pair-switch.css";
import type { PairNote } from "@/lib/portal/noren/pair";

/**
 * 店ページと、その店の特集記事（店 1 軒の記事）を行き来する帯。2 つのページの両方に、同じ見た目で置く。
 * 札は 2 枚（左「店の紹介」・右「この店の特集」）。いまいるページの札が朱で選ばれた状態（aria-current="page"）、もう一方は押すと移る。
 * 上端のヘッダーの下に細く残る（CSS の position: sticky）。特集記事の目次札 .vF-idx は、この帯の下にずらす（pair-switch.css）。
 * 対の組み方は lib/portal/noren/pair.ts（ID の対応表だけ。店名の部分一致はしない）。サーバーコンポーネント。
 */
export type PairSwitchProps = {
  /** いまいるページ */
  current: "shop" | "feature";
  shopName: string;
  shopHref: string;
  featureHref: string;
  /** 「店の紹介」の説明（営業時間・地図・予約…。その店のデータにあるものだけ） */
  shopNote: PairNote;
  /** 「この店の特集」の説明（編集部が N つの視点で紹介…） */
  featureNote: PairNote;
};

export default function PairSwitch({ current, shopName, shopHref, featureHref, shopNote, featureNote }: PairSwitchProps) {
  const tabs = [
    { key: "shop", label: "店の紹介", note: shopNote, href: shopHref },
    { key: "feature", label: "この店の特集", note: featureNote, href: featureHref },
  ] as const;
  return (
    <nav className="vP-bar" aria-label={`${shopName} の店の紹介と特集`} data-pair-current={current}>
      <div className="vP-in">
        <p className="vP-name">
          <span className="vP-k">この店</span>
          <b>{shopName}</b>
        </p>
        <ul className="vP-tabs">
          {tabs.map((t) => {
            const on = t.key === current;
            const inner = (
              <>
                <b>{t.label}</b>
                <small>
                  {t.note.opt && <span className="vP-opt">{t.note.opt}</span>}
                  {t.note.text}
                </small>
              </>
            );
            return (
              <li key={t.key}>
                {on ? (
                  <span className="vP-tab is-on" aria-current="page">
                    {inner}
                  </span>
                ) : (
                  <Link href={t.href} className="vP-tab" data-cursor="VIEW">
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
