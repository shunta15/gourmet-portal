import Link from "next/link";
import { IconChevron } from "./Icons";
import Nm from "./Nm";

/**
 * パンくず(探す・店の紹介の上の「ホーム > 体験を探す」「トップ > 京都府 > …」)。小さな薄い字で、区切りは細い「>」。
 * items の最後(今のページ)は href なし。tone="dark" は濃い面の帯の下(店の紹介)で、明るい地に薄い字になるので既定の light と同じ。
 * 構造化データ(BreadcrumbList)は出さない(必要なら各ページで JsonLd を足す)。
 */
export default function Crumbs({ items, className = "" }: { items: Array<{ label: string; href?: string }>; className?: string }) {
  return (
    <nav className={`vk-crumbs ${className}`.trim()} aria-label="現在のページの位置">
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${i}-${it.label}`}>
              {it.href && !last ? (
                <Link href={it.href}>
                  <Nm text={it.label} />
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>
                  <Nm text={it.label} />
                </span>
              )}
              {last ? null : <IconChevron className="vk-crumbs-sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
