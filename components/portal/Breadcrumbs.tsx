import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

export interface Crumb {
  name: string;
  /** サイト内パス（'/beauty' など）。最後の1つは現在のページ */
  href: string;
}

/**
 * パンくず。表示と JSON-LD（BreadcrumbList）を同じ配列から作る。
 * 最後の要素は現在地なのでリンクにしない。
 */
export default function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const ld = breadcrumb(items.map((c) => ({ name: c.name, url: absUrl(c.href) })));
  return (
    <>
      <nav className={`mp-crumbs ${className}`.trim()} aria-label="パンくず">
        <ol>
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} {...(last ? { "aria-current": "page" as const } : {})}>
                {last ? <span>{c.name}</span> : <Link href={c.href}>{c.name}</Link>}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={ld} />
    </>
  );
}
